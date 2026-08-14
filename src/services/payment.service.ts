import { CurrencyCode, PaymentStatus, PricingPeriod, RentalStatus } from "../constants/enums";
import { assetRepository } from "../repositories/asset.repository";
import { clientRepository } from "../repositories/client.repository";
import { paymentRepository, type CreatePaymentData } from "../repositories/payment.repository";
import { rentalRepository } from "../repositories/rental.repository";
import type {
  PaymentEntity,
  PaymentReminderEntity,
  PaymentWithComputed,
  RentalEntity,
} from "../types/entity.types";
import { AppError } from "../utils/app-error";

export interface RecordPaymentInput {
  amountCdf: string;
  amountUsd: string;
  paidAt?: string;
  method?: string | null;
  notes?: string | null;
}

/** Safety cap on how many future installments a single overpayment can cascade into (guards against a fat-fingered amount). */
const MAX_ROLLOVER_STEPS = 25;
const EPSILON = 0.005;

function parseDateOnly(value: string): Date {
  const parts = value.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** How far ahead to generate the next installment, so it can be flagged as "due soon" before it's actually due. */
const DUE_SOON_DAYS = 7;

/** Mirrors the step logic used client-side for reminders — one source of truth for "what is the next billing date". */
function addPeriod(date: Date, period: PricingPeriod): Date {
  const next = new Date(date);
  switch (period) {
    case PricingPeriod.HOURLY:
    case PricingPeriod.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case PricingPeriod.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case PricingPeriod.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

class PaymentService {
  /** Generates every installment whose period has started, up to today (and up to `endDate` if the rental has one). Idempotent. */
  async ensureScheduleUpToDate(rental: RentalEntity): Promise<void> {
    if (rental.status !== RentalStatus.ACTIVE) return;

    const today = startOfDay(new Date());
    const horizon = addDays(today, DUE_SOON_DAYS);
    const rentalEnd = rental.endDate ? startOfDay(parseDateOnly(rental.endDate)) : null;

    const latest = await paymentRepository.findLatestForRental(rental.id);
    let periodStart = latest
      ? addPeriod(startOfDay(parseDateOnly(latest.periodStart)), rental.pricingPeriod)
      : startOfDay(parseDateOnly(rental.startDate));

    const rows: CreatePaymentData[] = [];
    while (periodStart.getTime() <= horizon.getTime() && (!rentalEnd || periodStart.getTime() <= rentalEnd.getTime())) {
      const periodEnd = addPeriod(periodStart, rental.pricingPeriod);
      const cappedPeriodEnd = rentalEnd && periodEnd.getTime() > rentalEnd.getTime() ? rentalEnd : periodEnd;

      rows.push(this.buildInstallmentRow(rental, periodStart, cappedPeriodEnd));
      periodStart = periodEnd;
    }

    await paymentRepository.bulkCreate(rows);
  }

  async listForRental(rentalId: string, organizationId: string): Promise<PaymentWithComputed[]> {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental || rental.organizationId !== organizationId) {
      throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");
    }

    await this.ensureScheduleUpToDate(rental);
    const payments = await paymentRepository.findByRental(rentalId);
    return payments.map((p) => this.withComputed(p));
  }

  async listReminders(organizationId: string): Promise<PaymentReminderEntity[]> {
    const [rentals, assets, clients] = await Promise.all([
      rentalRepository.findAll({ organizationId }),
      assetRepository.findAll(organizationId),
      clientRepository.findAll(organizationId),
    ]);

    for (const rental of rentals) {
      if (rental.status === RentalStatus.ACTIVE) {
        await this.ensureScheduleUpToDate(rental);
      }
    }

    const rentalMap = new Map(rentals.map((r) => [r.id, r]));
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const outstanding = await paymentRepository.findOutstandingByOrganization(organizationId);
    return outstanding
      .map((p) => {
        const rental = rentalMap.get(p.rentalId);
        const asset = rental ? assetMap.get(rental.assetId) : undefined;
        const client = rental ? clientMap.get(rental.clientId) : undefined;
        const today = startOfDay(new Date());
        const due = startOfDay(parseDateOnly(p.dueDate));
        const daysOffset = Math.round((due.getTime() - today.getTime()) / 86_400_000);

        return {
          ...this.withComputed(p),
          daysOffset,
          dueSoon: daysOffset >= 0 && daysOffset <= DUE_SOON_DAYS,
          assetName: asset?.name ?? "Bien inconnu",
          clientName: client ? `${client.firstName} ${client.lastName}` : "Client inconnu",
          contractNumber: rental?.contractNumber ?? null,
          pricingPeriod: rental?.pricingPeriod ?? PricingPeriod.MONTHLY,
        };
      })
      .sort((a, b) => {
        if (a.isLate !== b.isLate) return a.isLate ? -1 : 1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }

  /**
   * Applies a payment to an installment. Any amount beyond what's still owed on it rolls over
   * into the following installment(s) (generated on demand if needed), up to `MAX_ROLLOVER_STEPS`.
   */
  async recordPayment(
    rentalId: string,
    paymentId: string,
    organizationId: string,
    input: RecordPaymentInput,
  ): Promise<PaymentWithComputed> {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental || rental.organizationId !== organizationId) {
      throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");
    }

    let payment = await paymentRepository.findById(paymentId);
    if (!payment || payment.organizationId !== organizationId || payment.rentalId !== rentalId) {
      throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
    }
    if (payment.status === PaymentStatus.PAID) {
      throw new AppError("Cette échéance est déjà soldée.", 409, "PAYMENT_ALREADY_PAID");
    }

    let remainingCdf = Number(input.amountCdf);
    let remainingUsd = Number(input.amountUsd);
    if (!(remainingCdf > 0) && !(remainingUsd > 0)) {
      throw new AppError("Le montant payé doit être positif.", 400, "INVALID_AMOUNT");
    }
    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    let lastUpdated: PaymentEntity = payment;
    let step = 0;

    while (payment && step < MAX_ROLLOVER_STEPS) {
      step += 1;

      const alreadyPaidCdf = Number(payment.paidAmountCdf ?? "0");
      const alreadyPaidUsd = Number(payment.paidAmountUsd ?? "0");
      const dueCdf = Number(payment.dueAmountCdf);
      const dueUsd = Number(payment.dueAmountUsd);
      const outstandingCdf = Math.max(0, dueCdf - alreadyPaidCdf);
      const outstandingUsd = Math.max(0, dueUsd - alreadyPaidUsd);

      const appliedCdf = Math.min(remainingCdf, outstandingCdf);
      const appliedUsd = Math.min(remainingUsd, outstandingUsd);

      const newPaidCdf = alreadyPaidCdf + appliedCdf;
      const newPaidUsd = alreadyPaidUsd + appliedUsd;

      const isFullyPaid =
        rental.billingCurrency === CurrencyCode.USD ? newPaidUsd >= dueUsd - EPSILON : newPaidCdf >= dueCdf - EPSILON;
      const newStatus = isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

      const updated = await paymentRepository.applyPayment(payment.id, {
        status: newStatus,
        paidAt,
        paidAmountCdf: String(newPaidCdf),
        paidAmountUsd: String(newPaidUsd),
        method: input.method ?? null,
        notes: input.notes ?? null,
      });
      lastUpdated = updated!;

      remainingCdf -= appliedCdf;
      remainingUsd -= appliedUsd;

      const hasOverflow = isFullyPaid && (remainingCdf > EPSILON || remainingUsd > EPSILON);
      if (!hasOverflow) break;

      const next = await this.getOrCreateNextInstallment(rental, payment);
      if (!next) break; // Rental has no further periods to roll the surplus into.
      payment = next;
    }

    return this.withComputed(lastUpdated);
  }

  async markPending(id: string, organizationId: string): Promise<PaymentWithComputed> {
    await this.assertInOrganization(id, organizationId);
    const updated = await paymentRepository.markPending(id);
    return this.withComputed(updated!);
  }

  private buildInstallmentRow(rental: RentalEntity, periodStart: Date, periodEnd: Date): CreatePaymentData {
    return {
      organizationId: rental.organizationId,
      rentalId: rental.id,
      periodStart: formatDateOnly(periodStart),
      periodEnd: formatDateOnly(periodEnd),
      dueDate: formatDateOnly(periodStart),
      dueAmountCdf: rental.amountCdf,
      dueAmountUsd: rental.amountUsd,
      currency: rental.billingCurrency,
      status: PaymentStatus.PENDING,
    };
  }

  /** Finds (or generates) the installment immediately following `payment` — used to roll an overpayment forward. */
  private async getOrCreateNextInstallment(
    rental: RentalEntity,
    payment: PaymentEntity,
  ): Promise<PaymentEntity | null> {
    const periodStart = startOfDay(parseDateOnly(payment.periodEnd));

    const existing = await paymentRepository.findByRental(rental.id);
    const found = existing.find((p) => p.periodStart === formatDateOnly(periodStart));
    if (found) return found;

    const rentalEnd = rental.endDate ? startOfDay(parseDateOnly(rental.endDate)) : null;
    if (rentalEnd && periodStart.getTime() > rentalEnd.getTime()) return null;

    const periodEnd = addPeriod(periodStart, rental.pricingPeriod);
    const cappedPeriodEnd = rentalEnd && periodEnd.getTime() > rentalEnd.getTime() ? rentalEnd : periodEnd;

    const [created] = await paymentRepository.bulkCreate([
      this.buildInstallmentRow(rental, periodStart, cappedPeriodEnd),
    ]);
    return created ?? null;
  }

  private async assertInOrganization(id: string, organizationId: string): Promise<PaymentEntity> {
    const payment = await paymentRepository.findById(id);
    if (!payment || payment.organizationId !== organizationId) {
      throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
    }
    return payment;
  }

  private withComputed(payment: PaymentEntity): PaymentWithComputed {
    const today = startOfDay(new Date());
    const due = startOfDay(parseDateOnly(payment.dueDate));
    const unsettled = payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PARTIAL;
    const isLate = unsettled && due.getTime() < today.getTime();
    return { ...payment, isLate };
  }
}

export const paymentService = new PaymentService();

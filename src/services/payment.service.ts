import { PaymentStatus, PricingPeriod, RentalStatus } from "../constants/enums";
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

export interface MarkPaidInput {
  paidAt?: string;
  paidAmountCdf?: string;
  paidAmountUsd?: string;
  method?: string | null;
  notes?: string | null;
}

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

      rows.push({
        organizationId: rental.organizationId,
        rentalId: rental.id,
        periodStart: formatDateOnly(periodStart),
        periodEnd: formatDateOnly(cappedPeriodEnd),
        dueDate: formatDateOnly(periodStart),
        dueAmountCdf: rental.amountCdf,
        dueAmountUsd: rental.amountUsd,
        currency: rental.billingCurrency,
        status: PaymentStatus.PENDING,
      });

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

    const pending = await paymentRepository.findPendingByOrganization(organizationId);
    return pending
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

  async markPaid(id: string, organizationId: string, input: MarkPaidInput): Promise<PaymentWithComputed> {
    const payment = await this.assertInOrganization(id, organizationId);

    const updated = await paymentRepository.markPaid(id, {
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      paidAmountCdf: input.paidAmountCdf ?? payment.dueAmountCdf,
      paidAmountUsd: input.paidAmountUsd ?? payment.dueAmountUsd,
      method: input.method ?? null,
      notes: input.notes ?? null,
    });
    return this.withComputed(updated!);
  }

  async markPending(id: string, organizationId: string): Promise<PaymentWithComputed> {
    await this.assertInOrganization(id, organizationId);
    const updated = await paymentRepository.markPending(id);
    return this.withComputed(updated!);
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
    const isLate = payment.status === PaymentStatus.PENDING && due.getTime() < today.getTime();
    return { ...payment, isLate };
  }
}

export const paymentService = new PaymentService();

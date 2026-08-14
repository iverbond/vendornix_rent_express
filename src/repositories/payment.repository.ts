import { PaymentModel, RentalModel } from "../database";
import { PaymentStatus, RentalStatus } from "../constants/enums";
import type { PaymentEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreatePaymentData {
  organizationId: string;
  rentalId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  dueAmountCdf: string;
  dueAmountUsd: string;
  currency: PaymentEntity["currency"];
  status: PaymentStatus;
}

export interface ApplyPaymentData {
  status: PaymentStatus.PARTIAL | PaymentStatus.PAID;
  paidAt: Date;
  paidAmountCdf: string;
  paidAmountUsd: string;
  method?: string | null;
  notes?: string | null;
}

class PaymentRepository {
  async findByRental(rentalId: string): Promise<PaymentEntity[]> {
    const rows = await PaymentModel.findAll({
      where: { rentalId },
      order: [["dueDate", "ASC"]],
    });
    return rows.map((r) => toPublicJson<PaymentEntity>(r));
  }

  async findLatestForRental(rentalId: string): Promise<PaymentEntity | null> {
    const row = await PaymentModel.findOne({ where: { rentalId }, order: [["dueDate", "DESC"]] });
    return row ? toPublicJson<PaymentEntity>(row) : null;
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const row = await PaymentModel.findByPk(id);
    return row ? toPublicJson<PaymentEntity>(row) : null;
  }

  /** PENDING and PARTIAL installments on ACTIVE rentals — both still need attention. */
  async findOutstandingByOrganization(organizationId: string): Promise<PaymentEntity[]> {
    const rows = await PaymentModel.findAll({
      where: { organizationId, status: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      include: [{ model: RentalModel, as: "rental", where: { status: RentalStatus.ACTIVE }, attributes: [] }],
      order: [["dueDate", "ASC"]],
    });
    return rows.map((r) => toPublicJson<PaymentEntity>(r));
  }

  async bulkCreate(rows: CreatePaymentData[]): Promise<PaymentEntity[]> {
    if (rows.length === 0) return [];
    const created = await PaymentModel.bulkCreate(rows, { returning: true });
    return created.map((r) => toPublicJson<PaymentEntity>(r));
  }

  async applyPayment(id: string, data: ApplyPaymentData): Promise<PaymentEntity | null> {
    const row = await PaymentModel.findByPk(id);
    if (!row) return null;
    await row.update({
      status: data.status,
      paidAt: data.paidAt,
      paidAmountCdf: data.paidAmountCdf,
      paidAmountUsd: data.paidAmountUsd,
      method: data.method ?? null,
      notes: data.notes ?? null,
    });
    return toPublicJson<PaymentEntity>(row);
  }

  async markPending(id: string): Promise<PaymentEntity | null> {
    const row = await PaymentModel.findByPk(id);
    if (!row) return null;
    await row.update({
      status: PaymentStatus.PENDING,
      paidAt: null,
      paidAmountCdf: null,
      paidAmountUsd: null,
    });
    return toPublicJson<PaymentEntity>(row);
  }
}

export const paymentRepository = new PaymentRepository();

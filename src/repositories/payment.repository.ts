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

export interface MarkPaidData {
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

  async findPendingByOrganization(organizationId: string): Promise<PaymentEntity[]> {
    const rows = await PaymentModel.findAll({
      where: { organizationId, status: PaymentStatus.PENDING },
      include: [{ model: RentalModel, as: "rental", where: { status: RentalStatus.ACTIVE }, attributes: [] }],
      order: [["dueDate", "ASC"]],
    });
    return rows.map((r) => toPublicJson<PaymentEntity>(r));
  }

  async bulkCreate(rows: CreatePaymentData[]): Promise<void> {
    if (rows.length === 0) return;
    await PaymentModel.bulkCreate(rows);
  }

  async markPaid(id: string, data: MarkPaidData): Promise<PaymentEntity | null> {
    const row = await PaymentModel.findByPk(id);
    if (!row) return null;
    await row.update({
      status: PaymentStatus.PAID,
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

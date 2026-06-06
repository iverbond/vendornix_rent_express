import { RentalModel } from "../database";
import { CurrencyCode, PricingPeriod, RentalStatus } from "../constants/enums";
import type { RentalEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateRentalData {
  organizationId: string;
  assetId: string;
  clientId: string;
  status?: RentalStatus;
  startDate: string;
  endDate?: string | null;
  pricingPeriod: PricingPeriod;
  amountCdf: string;
  amountUsd: string;
  billingCurrency: CurrencyCode;
  vatRate: string;
  vatIncluded: boolean;
  depositCdf?: string | null;
  depositUsd?: string | null;
  notes?: string | null;
  contractNumber?: string | null;
  contractContent?: string | null;
}

export interface UpdateRentalData {
  status?: RentalStatus;
  startDate?: string;
  endDate?: string | null;
  pricingPeriod?: PricingPeriod;
  amountCdf?: string;
  amountUsd?: string;
  billingCurrency?: CurrencyCode;
  vatRate?: string;
  vatIncluded?: boolean;
  depositCdf?: string | null;
  depositUsd?: string | null;
  notes?: string | null;
  contractNumber?: string | null;
  contractContent?: string | null;
}

class RentalRepository {
  async findAll(filters?: { organizationId?: string; assetId?: string; clientId?: string }): Promise<RentalEntity[]> {
    const where: Record<string, string> = {};
    if (filters?.organizationId) where.organizationId = filters.organizationId;
    if (filters?.assetId) where.assetId = filters.assetId;
    if (filters?.clientId) where.clientId = filters.clientId;

    const rows = await RentalModel.findAll({
      where: Object.keys(where).length ? where : undefined,
      order: [["startDate", "DESC"]],
    });
    return rows.map((r) => toPublicJson<RentalEntity>(r));
  }

  async findById(id: string): Promise<RentalEntity | null> {
    const row = await RentalModel.findByPk(id);
    return row ? toPublicJson<RentalEntity>(row) : null;
  }

  async findActiveByAsset(assetId: string): Promise<RentalEntity | null> {
    const row = await RentalModel.findOne({
      where: { assetId, status: RentalStatus.ACTIVE },
      order: [["startDate", "DESC"]],
    });
    return row ? toPublicJson<RentalEntity>(row) : null;
  }

  async create(data: CreateRentalData): Promise<RentalEntity> {
    const row = await RentalModel.create({
      organizationId: data.organizationId,
      assetId: data.assetId,
      clientId: data.clientId,
      status: data.status ?? RentalStatus.ACTIVE,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      pricingPeriod: data.pricingPeriod,
      amountCdf: data.amountCdf,
      amountUsd: data.amountUsd,
      billingCurrency: data.billingCurrency,
      vatRate: data.vatRate,
      vatIncluded: data.vatIncluded,
      depositCdf: data.depositCdf ?? null,
      depositUsd: data.depositUsd ?? null,
      notes: data.notes ?? null,
      contractNumber: data.contractNumber ?? null,
      contractContent: data.contractContent ?? null,
    });
    return toPublicJson<RentalEntity>(row);
  }

  async update(id: string, data: UpdateRentalData): Promise<RentalEntity | null> {
    const row = await RentalModel.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return toPublicJson<RentalEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await RentalModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const rentalRepository = new RentalRepository();

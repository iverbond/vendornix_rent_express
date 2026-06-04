import { AssetModel } from "../database";
import { AssetStatus, AssetType } from "../constants/enums";
import type { AssetEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateAssetData {
  organizationId: string;
  parentAssetId?: string | null;
  name: string;
  description?: string | null;
  assetType: AssetType;
  rentable?: boolean;
  status?: AssetStatus;
  priceCdf?: string | null;
  priceUsd?: string | null;
  location?: string | null;
  attributes?: Record<string, unknown> | null;
}

export interface UpdateAssetData {
  parentAssetId?: string | null;
  name?: string;
  description?: string | null;
  assetType?: AssetType;
  rentable?: boolean;
  status?: AssetStatus;
  priceCdf?: string | null;
  priceUsd?: string | null;
  location?: string | null;
  attributes?: Record<string, unknown> | null;
}

class AssetRepository {
  async findAll(organizationId?: string): Promise<AssetEntity[]> {
    const rows = await AssetModel.findAll({
      where: organizationId ? { organizationId } : undefined,
      order: [["name", "ASC"]],
    });
    return rows.map((r) => toPublicJson<AssetEntity>(r));
  }

  async findById(id: string): Promise<AssetEntity | null> {
    const row = await AssetModel.findByPk(id);
    return row ? toPublicJson<AssetEntity>(row) : null;
  }

  async findByOrganization(organizationId: string): Promise<AssetEntity[]> {
    return this.findAll(organizationId);
  }

  async create(data: CreateAssetData): Promise<AssetEntity> {
    const row = await AssetModel.create({
      organizationId: data.organizationId,
      parentAssetId: data.parentAssetId ?? null,
      name: data.name,
      description: data.description ?? null,
      assetType: data.assetType,
      rentable: data.rentable ?? true,
      status: data.status ?? AssetStatus.AVAILABLE,
      priceCdf: data.priceCdf ?? null,
      priceUsd: data.priceUsd ?? null,
      location: data.location ?? null,
      attributes: data.attributes ?? null,
    });
    return toPublicJson<AssetEntity>(row);
  }

  async update(id: string, data: UpdateAssetData): Promise<AssetEntity | null> {
    const row = await AssetModel.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return toPublicJson<AssetEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await AssetModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const assetRepository = new AssetRepository();

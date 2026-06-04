import { AssetImageModel } from "../database";
import type { AssetImageEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateAssetImageData {
  assetId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  caption?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

class AssetImageRepository {
  async findByAsset(assetId: string): Promise<AssetImageEntity[]> {
    const rows = await AssetImageModel.findAll({
      where: { assetId },
      order: [
        ["isPrimary", "DESC"],
        ["sortOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    return rows.map((r) => toPublicJson<AssetImageEntity>(r));
  }

  async findById(id: string): Promise<AssetImageEntity | null> {
    const row = await AssetImageModel.findByPk(id);
    return row ? toPublicJson<AssetImageEntity>(row) : null;
  }

  async countByAsset(assetId: string): Promise<number> {
    return AssetImageModel.count({ where: { assetId } });
  }

  async create(data: CreateAssetImageData): Promise<AssetImageEntity> {
    const row = await AssetImageModel.create({
      assetId: data.assetId,
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      caption: data.caption ?? null,
      isPrimary: data.isPrimary ?? false,
      sortOrder: data.sortOrder ?? 0,
    });
    return toPublicJson<AssetImageEntity>(row);
  }

  async clearPrimaryForAsset(assetId: string): Promise<void> {
    await AssetImageModel.update({ isPrimary: false }, { where: { assetId, isPrimary: true } });
  }

  async setPrimary(id: string, assetId: string): Promise<AssetImageEntity | null> {
    await this.clearPrimaryForAsset(assetId);
    const row = await AssetImageModel.findOne({ where: { id, assetId } });
    if (!row) return null;
    await row.update({ isPrimary: true });
    return toPublicJson<AssetImageEntity>(row);
  }

  async delete(id: string): Promise<AssetImageEntity | null> {
    const row = await AssetImageModel.findByPk(id);
    if (!row) return null;
    const entity = toPublicJson<AssetImageEntity>(row);
    await row.destroy();
    return entity;
  }
}

export const assetImageRepository = new AssetImageRepository();

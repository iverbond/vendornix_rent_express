import { assetRepository, type CreateAssetData, type UpdateAssetData } from "../repositories/asset.repository";
import { organizationRepository } from "../repositories/organization.repository";
import type { AssetEntity, AssetTreeNode } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class AssetService {
  async getAll(organizationId?: string): Promise<AssetEntity[]> {
    return assetRepository.findAll(organizationId);
  }

  async getById(id: string): Promise<AssetEntity> {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");
    return asset;
  }

  async getTree(organizationId?: string): Promise<AssetTreeNode[]> {
    const assets = await assetRepository.findAll(organizationId);
    const byId = new Map(assets.map((a) => [a.id, { ...a, children: [] as AssetTreeNode[] }]));
    const roots: AssetTreeNode[] = [];

    for (const asset of byId.values()) {
      if (asset.parentAssetId && byId.has(asset.parentAssetId)) {
        byId.get(asset.parentAssetId)!.children.push(asset);
      } else {
        roots.push(asset);
      }
    }

    return roots;
  }

  async create(dto: CreateAssetData): Promise<AssetEntity> {
    await this.assertOrganization(dto.organizationId);
    if (dto.parentAssetId) {
      const parent = await assetRepository.findById(dto.parentAssetId);
      if (!parent || parent.organizationId !== dto.organizationId) {
        throw new AppError("Parent asset not found.", 404, "PARENT_ASSET_NOT_FOUND");
      }
    }
    return assetRepository.create(dto);
  }

  async update(id: string, dto: UpdateAssetData): Promise<AssetEntity> {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");

    if (dto.parentAssetId) {
      if (dto.parentAssetId === id) {
        throw new AppError("Asset cannot be its own parent.", 400, "INVALID_PARENT");
      }
      const parent = await assetRepository.findById(dto.parentAssetId);
      if (!parent || parent.organizationId !== existing.organizationId) {
        throw new AppError("Parent asset not found.", 404, "PARENT_ASSET_NOT_FOUND");
      }
    }

    const updated = await assetRepository.update(id, dto);
    if (!updated) throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await assetRepository.delete(id);
    if (!deleted) throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");
  }

  private async assertOrganization(organizationId: string): Promise<void> {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
  }
}

export const assetService = new AssetService();

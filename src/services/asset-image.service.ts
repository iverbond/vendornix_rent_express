import fs from "fs/promises";
import path from "path";
import { assetRepository } from "../repositories/asset.repository";
import { assetImageRepository } from "../repositories/asset-image.repository";
import type { AssetImageEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";
import { buildAssetImagePublicUrl, resolveAssetImageDiskPath } from "../utils/asset-image-url.util";
import { env } from "../config/env";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type AssetImageResponse = AssetImageEntity & { url: string };

class AssetImageService {
  toResponse(image: AssetImageEntity): AssetImageResponse {
    return {
      ...image,
      url: buildAssetImagePublicUrl(image.assetId, image.fileName),
    };
  }

  async listByAsset(assetId: string): Promise<AssetImageResponse[]> {
    await this.assertAsset(assetId);
    const images = await assetImageRepository.findByAsset(assetId);
    return images.map((img) => this.toResponse(img));
  }

  async upload(
    assetId: string,
    file: Express.Multer.File,
    caption?: string | null,
  ): Promise<AssetImageResponse> {
    await this.assertAsset(assetId);

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new AppError("Unsupported image type. Use JPEG, PNG, WebP or GIF.", 400, "INVALID_IMAGE_TYPE");
    }

    const count = await assetImageRepository.countByAsset(assetId);
    if (count >= env.UPLOAD_MAX_IMAGES_PER_ASSET) {
      throw new AppError(
        `Maximum ${env.UPLOAD_MAX_IMAGES_PER_ASSET} images per asset.`,
        400,
        "IMAGE_LIMIT_REACHED",
      );
    }

    const isFirst = count === 0;
    const image = await assetImageRepository.create({
      assetId,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      caption: caption?.trim() || null,
      isPrimary: isFirst,
      sortOrder: count,
    });

    return this.toResponse(image);
  }

  async setPrimary(assetId: string, imageId: string): Promise<AssetImageResponse> {
    await this.assertAsset(assetId);
    const updated = await assetImageRepository.setPrimary(imageId, assetId);
    if (!updated) throw new AppError("Image not found.", 404, "ASSET_IMAGE_NOT_FOUND");
    return this.toResponse(updated);
  }

  async delete(assetId: string, imageId: string): Promise<void> {
    await this.assertAsset(assetId);
    const image = await assetImageRepository.findById(imageId);
    if (!image || image.assetId !== assetId) {
      throw new AppError("Image not found.", 404, "ASSET_IMAGE_NOT_FOUND");
    }

    const wasPrimary = image.isPrimary;
    await assetImageRepository.delete(imageId);

    const diskPath = resolveAssetImageDiskPath(assetId, image.fileName);
    await fs.unlink(diskPath).catch(() => undefined);

    if (wasPrimary) {
      const remaining = await assetImageRepository.findByAsset(assetId);
      if (remaining[0]) {
        await assetImageRepository.setPrimary(remaining[0].id, assetId);
      }
    }
  }

  private async assertAsset(assetId: string): Promise<void> {
    const asset = await assetRepository.findById(assetId);
    if (!asset) throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");
  }
}

export const assetImageService = new AssetImageService();

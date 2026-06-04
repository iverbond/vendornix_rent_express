import type { CreateAssetData, UpdateAssetData } from "../repositories/asset.repository";

const toDecimalString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return null;
  }
  return String(num);
};

const toNullableUuid = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
};

const toAttributes = (value: unknown): Record<string, unknown> | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

export const normalizeCreateAssetPayload = (body: Record<string, unknown>): CreateAssetData => ({
  organizationId: String(body.organizationId),
  parentAssetId: toNullableUuid(body.parentAssetId),
  name: String(body.name).trim(),
  description: body.description != null ? String(body.description) : null,
  assetType: body.assetType as CreateAssetData["assetType"],
  rentable: body.rentable !== undefined ? Boolean(body.rentable) : true,
  status: body.status as CreateAssetData["status"],
  priceCdf: toDecimalString(body.priceCdf),
  priceUsd: toDecimalString(body.priceUsd),
  location: body.location != null && String(body.location).trim() ? String(body.location).trim() : null,
  attributes: toAttributes(body.attributes),
});

export const normalizeUpdateAssetPayload = (body: Record<string, unknown>): UpdateAssetData => {
  const dto: UpdateAssetData = {};
  if (body.parentAssetId !== undefined) {
    dto.parentAssetId = toNullableUuid(body.parentAssetId);
  }
  if (body.name !== undefined) dto.name = String(body.name).trim();
  if (body.description !== undefined) {
    dto.description = body.description != null ? String(body.description) : null;
  }
  if (body.assetType !== undefined) dto.assetType = body.assetType as UpdateAssetData["assetType"];
  if (body.rentable !== undefined) dto.rentable = Boolean(body.rentable);
  if (body.status !== undefined) dto.status = body.status as UpdateAssetData["status"];
  if (body.priceCdf !== undefined) dto.priceCdf = toDecimalString(body.priceCdf);
  if (body.priceUsd !== undefined) dto.priceUsd = toDecimalString(body.priceUsd);
  if (body.location !== undefined) {
    dto.location = body.location != null && String(body.location).trim() ? String(body.location).trim() : null;
  }
  if (body.attributes !== undefined) dto.attributes = toAttributes(body.attributes);
  return dto;
};

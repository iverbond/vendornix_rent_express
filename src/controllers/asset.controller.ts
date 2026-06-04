import { Request, Response } from "express";
import { assetImageService } from "../services/asset-image.service";
import { assetService } from "../services/asset.service";
import { asyncHandler } from "../utils/async-handler";
import {
  normalizeCreateAssetPayload,
  normalizeUpdateAssetPayload,
} from "../utils/asset-payload.util";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.query.organizationId as string | undefined;
  const assets = await assetService.getAll(organizationId);
  return sendSuccess(res, "Assets retrieved.", assets);
});

export const getAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = getRouteParam(req.params.id);
  const asset = await assetService.getById(id);
  const images = await assetImageService.listByAsset(id);
  return sendSuccess(res, "Asset retrieved.", { ...asset, images });
});

export const getAssetTree = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.query.organizationId as string | undefined;
  const tree = await assetService.getTree(organizationId);
  return sendSuccess(res, "Asset tree retrieved.", tree);
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.create(normalizeCreateAssetPayload(req.body));
  return sendSuccess(res, "Asset created.", asset, undefined, 201);
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.update(
    getRouteParam(req.params.id),
    normalizeUpdateAssetPayload(req.body),
  );
  return sendSuccess(res, "Asset updated.", asset);
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  await assetService.delete(getRouteParam(req.params.id));
  return sendSuccess(res, "Asset deleted.", null);
});

import { Request, Response } from "express";
import { assetImageService } from "../services/asset-image.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { AppError } from "../utils/app-error";
import { sendSuccess } from "../utils/response";

export const listAssetImages = asyncHandler(async (req: Request, res: Response) => {
  const images = await assetImageService.listByAsset(getRouteParam(req.params.id));
  return sendSuccess(res, "Asset images retrieved.", images);
});

export const uploadAssetImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("No file uploaded.", 400, "NO_FILE");
  }
  const caption = typeof req.body.caption === "string" ? req.body.caption : undefined;
  const image = await assetImageService.upload(getRouteParam(req.params.id), req.file, caption);
  return sendSuccess(res, "Image uploaded.", image, undefined, 201);
});

export const setPrimaryAssetImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await assetImageService.setPrimary(
    getRouteParam(req.params.id),
    getRouteParam(req.params.imageId),
  );
  return sendSuccess(res, "Primary image updated.", image);
});

export const deleteAssetImage = asyncHandler(async (req: Request, res: Response) => {
  await assetImageService.delete(getRouteParam(req.params.id), getRouteParam(req.params.imageId));
  return sendSuccess(res, "Image deleted.", null);
});

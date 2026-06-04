import { body, param } from "express-validator";
import { uuidParam } from "./common.validators";

export const assetImageAssetParam = [uuidParam("id")] as const;

export const assetImageIdParams = [uuidParam("id"), uuidParam("imageId")] as const;

export const uploadAssetImageValidator = [
  ...assetImageAssetParam,
  body("caption").optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
] as const;

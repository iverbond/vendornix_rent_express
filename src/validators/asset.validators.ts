import { body, param, query } from "express-validator";
import { AssetStatus, AssetType } from "../constants/enums";
import { uuidParam } from "./common.validators";

const emptyToNull = (value: unknown): unknown => (value === "" ? null : value);

const optionalPrice = (field: "priceCdf" | "priceUsd") =>
  body(field)
    .optional({ nullable: true })
    .customSanitizer(emptyToNull)
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0;
    })
    .withMessage(`${field} must be a non-negative number`);

const optionalParentAssetId = () =>
  body("parentAssetId")
    .optional({ nullable: true })
    .customSanitizer(emptyToNull)
    .custom((value) => value === null || value === undefined || /^[0-9a-f-]{36}$/i.test(String(value)))
    .withMessage("parentAssetId must be a valid UUID");

export const listAssetsValidator = [
  query("organizationId").optional().isUUID(4),
] as const;

export const getAssetValidator = [uuidParam("id")] as const;

export const assetTreeValidator = [
  query("organizationId").optional().isUUID(4),
] as const;

export const createAssetValidator = [
  body("organizationId").isUUID(4),
  optionalParentAssetId(),
  body("name").trim().notEmpty().isLength({ max: 255 }),
  body("description").optional({ nullable: true }).isString(),
  body("location").optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body("assetType").isIn(Object.values(AssetType)),
  body("rentable").optional().isBoolean(),
  body("status").optional().isIn(Object.values(AssetStatus)),
  optionalPrice("priceCdf"),
  optionalPrice("priceUsd"),
  body("attributes").optional({ nullable: true }).isObject().withMessage("attributes must be an object"),
] as const;

export const updateAssetValidator = [
  uuidParam("id"),
  optionalParentAssetId(),
  body("name").optional().trim().notEmpty().isLength({ max: 255 }),
  body("description").optional({ nullable: true }).isString(),
  body("location").optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body("assetType").optional().isIn(Object.values(AssetType)),
  body("rentable").optional().isBoolean(),
  body("status").optional().isIn(Object.values(AssetStatus)),
  optionalPrice("priceCdf"),
  optionalPrice("priceUsd"),
  body("attributes").optional({ nullable: true }).isObject().withMessage("attributes must be an object"),
] as const;

export const deleteAssetValidator = [uuidParam("id")] as const;

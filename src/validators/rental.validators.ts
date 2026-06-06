import { body, param, query } from "express-validator";
import { CurrencyCode, PricingPeriod, RentalStatus } from "../constants/enums";
import { uuidParam } from "./common.validators";

const optionalPrice = (field: string) =>
  body(field)
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === "") return true;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0;
    })
    .withMessage(`${field} must be a non-negative number`);

const requiredPrice = (field: string) =>
  body(field)
    .custom((value) => {
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0;
    })
    .withMessage(`${field} must be a non-negative number`);

export const listRentalsValidator = [
  query("organizationId").optional().isUUID(4),
  query("assetId").optional().isUUID(4),
  query("clientId").optional().isUUID(4),
] as const;

export const getRentalValidator = [uuidParam("id")] as const;

export const getActiveRentalByAssetValidator = [uuidParam("assetId")] as const;

export const createRentalValidator = [
  body("organizationId").isUUID(4),
  body("assetId").isUUID(4),
  body("clientId").isUUID(4),
  body("status").optional().isIn(Object.values(RentalStatus)),
  body("startDate").isISO8601().toDate(),
  body("endDate").optional({ nullable: true }).isISO8601().toDate(),
  body("pricingPeriod").isIn(Object.values(PricingPeriod)),
  requiredPrice("amountCdf"),
  requiredPrice("amountUsd"),
  body("billingCurrency").optional().isIn(Object.values(CurrencyCode)),
  body("vatRate")
    .optional()
    .custom((value) => {
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    }),
  body("vatIncluded").optional().isBoolean(),
  optionalPrice("depositCdf"),
  optionalPrice("depositUsd"),
  body("notes").optional({ nullable: true }).isString(),
  body("contractContent").optional({ nullable: true }).isString(),
] as const;

export const updateRentalValidator = [
  uuidParam("id"),
  body("status").optional().isIn(Object.values(RentalStatus)),
  body("startDate").optional().isISO8601().toDate(),
  body("endDate").optional({ nullable: true }).isISO8601().toDate(),
  body("pricingPeriod").optional().isIn(Object.values(PricingPeriod)),
  optionalPrice("amountCdf"),
  optionalPrice("amountUsd"),
  body("billingCurrency").optional().isIn(Object.values(CurrencyCode)),
  body("vatRate")
    .optional()
    .custom((value) => {
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    }),
  body("vatIncluded").optional().isBoolean(),
  optionalPrice("depositCdf"),
  optionalPrice("depositUsd"),
  body("notes").optional({ nullable: true }).isString(),
  body("contractContent").optional({ nullable: true }).isString(),
] as const;

export const regenerateRentalContractValidator = [uuidParam("id")] as const;

export const deleteRentalValidator = [uuidParam("id")] as const;

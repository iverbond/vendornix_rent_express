import { body } from "express-validator";
import { uuidParam } from "./common.validators";

export const listRentalPaymentsValidator = [uuidParam("id")] as const;

export const markPaymentPaidValidator = [
  uuidParam("id"),
  uuidParam("paymentId"),
  body("paidAt").optional().isISO8601(),
  body("amountCdf").custom((value) => !Number.isNaN(Number(value)) && Number(value) >= 0),
  body("amountUsd").custom((value) => !Number.isNaN(Number(value)) && Number(value) >= 0),
  body("method").optional({ nullable: true }).isString().isLength({ max: 60 }),
  body("notes").optional({ nullable: true }).isString(),
] as const;

export const markPaymentPendingValidator = [uuidParam("id"), uuidParam("paymentId")] as const;

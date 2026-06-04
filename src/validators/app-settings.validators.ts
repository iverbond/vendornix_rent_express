import { body } from "express-validator";
import { CurrencyCode } from "../constants/enums";

export const updateAppSettingsValidator = [
  body("exchangeRate").optional().isDecimal(),
  body("defaultCurrency").optional().isIn(Object.values(CurrencyCode)),
] as const;

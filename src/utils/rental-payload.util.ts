import type { CreateRentalData, UpdateRentalData } from "../repositories/rental.repository";
import { CurrencyCode, PricingPeriod, RentalStatus } from "../constants/enums";

const toDecimalString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return null;
  return String(num);
};

const toRequiredDecimal = (value: unknown, field: string): string => {
  const parsed = toDecimalString(value);
  if (!parsed) throw new Error(`${field} is required`);
  return parsed;
};

const toDateString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  return String(value).slice(0, 10);
};

export const normalizeCreateRentalPayload = (body: Record<string, unknown>): CreateRentalData => ({
  organizationId: String(body.organizationId),
  assetId: String(body.assetId),
  clientId: String(body.clientId),
  status: (body.status as RentalStatus) ?? RentalStatus.ACTIVE,
  startDate: toDateString(body.startDate) ?? "",
  endDate: toDateString(body.endDate),
  pricingPeriod: body.pricingPeriod as PricingPeriod,
  amountCdf: toRequiredDecimal(body.amountCdf, "amountCdf"),
  amountUsd: toRequiredDecimal(body.amountUsd, "amountUsd"),
  billingCurrency: (body.billingCurrency as CurrencyCode) ?? CurrencyCode.CDF,
  vatRate: toDecimalString(body.vatRate) ?? "16",
  vatIncluded: Boolean(body.vatIncluded),
  depositCdf: toDecimalString(body.depositCdf),
  depositUsd: toDecimalString(body.depositUsd),
  notes: body.notes != null ? String(body.notes) : null,
});

export const normalizeUpdateRentalPayload = (body: Record<string, unknown>): UpdateRentalData => {
  const dto: UpdateRentalData = {};
  if (body.status !== undefined) dto.status = body.status as RentalStatus;
  if (body.startDate !== undefined) dto.startDate = toDateString(body.startDate) ?? undefined;
  if (body.endDate !== undefined) dto.endDate = toDateString(body.endDate);
  if (body.pricingPeriod !== undefined) dto.pricingPeriod = body.pricingPeriod as PricingPeriod;
  if (body.amountCdf !== undefined) dto.amountCdf = toDecimalString(body.amountCdf) ?? undefined;
  if (body.amountUsd !== undefined) dto.amountUsd = toDecimalString(body.amountUsd) ?? undefined;
  if (body.billingCurrency !== undefined) dto.billingCurrency = body.billingCurrency as CurrencyCode;
  if (body.vatRate !== undefined) dto.vatRate = toDecimalString(body.vatRate) ?? undefined;
  if (body.vatIncluded !== undefined) dto.vatIncluded = Boolean(body.vatIncluded);
  if (body.depositCdf !== undefined) dto.depositCdf = toDecimalString(body.depositCdf);
  if (body.depositUsd !== undefined) dto.depositUsd = toDecimalString(body.depositUsd);
  if (body.notes !== undefined) dto.notes = body.notes != null ? String(body.notes) : null;
  if (body.contractContent !== undefined) {
    dto.contractContent = body.contractContent != null ? String(body.contractContent) : null;
  }
  return dto;
};

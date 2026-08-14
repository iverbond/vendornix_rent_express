import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listRentalPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await paymentService.listForRental(getRouteParam(req.params.id), req.organizationId!);
  return sendSuccess(res, "Payments retrieved.", payments);
});

export const markPaymentPaid = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.markPaid(getRouteParam(req.params.paymentId), req.organizationId!, {
    paidAt: req.body.paidAt,
    paidAmountCdf: req.body.paidAmountCdf != null ? String(req.body.paidAmountCdf) : undefined,
    paidAmountUsd: req.body.paidAmountUsd != null ? String(req.body.paidAmountUsd) : undefined,
    method: req.body.method ?? null,
    notes: req.body.notes ?? null,
  });
  return sendSuccess(res, "Payment marked as paid.", payment);
});

export const markPaymentPending = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.markPending(getRouteParam(req.params.paymentId), req.organizationId!);
  return sendSuccess(res, "Payment marked as pending.", payment);
});

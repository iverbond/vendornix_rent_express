import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";

export const listPaymentReminders = asyncHandler(async (req: Request, res: Response) => {
  const reminders = await paymentService.listReminders(req.organizationId!);
  return sendSuccess(res, "Payment reminders retrieved.", reminders);
});

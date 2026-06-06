import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(String(req.body.email ?? ""));
  return sendSuccess(res, result.message, null);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(String(req.body.token ?? ""), String(req.body.password ?? ""));
  return sendSuccess(res, result.message, null);
});

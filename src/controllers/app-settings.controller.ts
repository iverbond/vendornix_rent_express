import { Request, Response } from "express";
import { appSettingsService } from "../services/app-settings.service";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";

export const getAppSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await appSettingsService.get();
  return sendSuccess(res, "Settings retrieved.", settings);
});

export const updateAppSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await appSettingsService.update(req.body);
  return sendSuccess(res, "Settings updated.", settings);
});

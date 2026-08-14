import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const session = await authService.login(String(req.body.email ?? ""), String(req.body.password ?? ""));
  return sendSuccess(res, "Connexion réussie.", {
    user: session.user,
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const session = await authService.register({
    firstName: String(req.body.firstName ?? ""),
    lastName: String(req.body.lastName ?? ""),
    email: String(req.body.email ?? ""),
    phone: req.body.phone ?? null,
    password: String(req.body.password ?? ""),
  });
  return sendSuccess(
    res,
    "Compte créé.",
    {
      user: session.user,
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    },
    undefined,
    201,
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(String(req.body.refreshToken ?? ""));
  return sendSuccess(res, "Jeton rafraîchi.", {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(String(req.body.email ?? ""));
  return sendSuccess(res, result.message, null);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(String(req.body.token ?? ""), String(req.body.password ?? ""));
  return sendSuccess(res, result.message, null);
});

import { Request, Response } from "express";
import { UserRole } from "../constants/enums";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

const isPlatformAdmin = (role?: UserRole): boolean =>
  role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.getAll();
  return sendSuccess(res, "Users retrieved.", users);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findByEmail(String(req.query.email ?? ""));
  return sendSuccess(res, "Search complete.", user ? [user] : []);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const id = getRouteParam(req.params.id);
  if (req.userId !== id && !isPlatformAdmin(req.userRole)) {
    throw new AppError("Accès refusé.", 403, "FORBIDDEN");
  }
  const user = await userService.getById(id);
  return sendSuccess(res, "User retrieved.", user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  return sendSuccess(res, "User created.", user, undefined, 201);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(getRouteParam(req.params.id), req.body);
  return sendSuccess(res, "User updated.", user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(getRouteParam(req.params.id));
  return sendSuccess(res, "User deleted.", null);
});

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.adminResetPassword(getRouteParam(req.params.id));
  return sendSuccess(res, "Lien de réinitialisation généré.", result);
});

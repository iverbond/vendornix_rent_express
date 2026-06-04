import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.getAll();
  return sendSuccess(res, "Users retrieved.", users);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(getRouteParam(req.params.id));
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

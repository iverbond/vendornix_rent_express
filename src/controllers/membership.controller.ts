import { Request, Response } from "express";
import { membershipService } from "../services/membership.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listMemberships = asyncHandler(async (_req: Request, res: Response) => {
  const memberships = await membershipService.getAll();
  return sendSuccess(res, "Memberships retrieved.", memberships);
});

export const createMembership = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.create(req.body);
  return sendSuccess(res, "Membership created.", membership, undefined, 201);
});

export const deleteMembership = asyncHandler(async (req: Request, res: Response) => {
  await membershipService.delete(getRouteParam(req.params.id));
  return sendSuccess(res, "Membership deleted.", null);
});

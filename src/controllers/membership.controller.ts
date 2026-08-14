import { Request, Response } from "express";
import { membershipService } from "../services/membership.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listMyMemberships = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await membershipService.getMine(req.userId!);
  return sendSuccess(res, "Memberships retrieved.", memberships);
});

export const listMemberships = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await membershipService.getAll(req.organizationId!);
  return sendSuccess(res, "Memberships retrieved.", memberships);
});

export const createMembership = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.create(
    { userId: req.body.userId, role: req.body.role },
    req.organizationId!,
  );
  return sendSuccess(res, "Membership created.", membership, undefined, 201);
});

export const updateMembershipRole = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.updateRole(
    getRouteParam(req.params.id),
    req.organizationId!,
    req.membershipRole!,
    req.body.role,
  );
  return sendSuccess(res, "Membership role updated.", membership);
});

export const deleteMembership = asyncHandler(async (req: Request, res: Response) => {
  await membershipService.delete(getRouteParam(req.params.id), req.organizationId!, req.membershipRole!);
  return sendSuccess(res, "Membership deleted.", null);
});

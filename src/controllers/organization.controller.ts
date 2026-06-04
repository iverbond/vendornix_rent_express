import { Request, Response } from "express";
import { organizationService } from "../services/organization.service";
import { asyncHandler } from "../utils/async-handler";
import {
  normalizeCreateOrganizationPayload,
  normalizeUpdateOrganizationPayload,
} from "../utils/organization-payload.util";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listOrganizations = asyncHandler(async (_req: Request, res: Response) => {
  const organizations = await organizationService.getAll();
  return sendSuccess(res, "Organizations retrieved.", organizations);
});

export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.getById(getRouteParam(req.params.id));
  return sendSuccess(res, "Organization retrieved.", organization);
});

export const createOrganization = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.create(normalizeCreateOrganizationPayload(req.body));
  return sendSuccess(res, "Organization created.", organization, undefined, 201);
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.update(
    getRouteParam(req.params.id),
    normalizeUpdateOrganizationPayload(req.body),
  );
  return sendSuccess(res, "Organization updated.", organization);
});

export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
  await organizationService.delete(getRouteParam(req.params.id));
  return sendSuccess(res, "Organization deleted.", null);
});

import { Request, Response } from "express";
import { clientService } from "../services/client.service";
import { asyncHandler } from "../utils/async-handler";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.query.organizationId as string | undefined;
  const clients = await clientService.getAll(organizationId);
  return sendSuccess(res, "Clients retrieved.", clients);
});

export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.getById(getRouteParam(req.params.id));
  return sendSuccess(res, "Client retrieved.", client);
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.create({
    organizationId: String(req.body.organizationId),
    firstName: String(req.body.firstName).trim(),
    lastName: String(req.body.lastName).trim(),
    email: req.body.email ?? null,
    phone: req.body.phone ?? null,
    nationalId: req.body.nationalId ?? null,
    address: req.body.address ?? null,
  });
  return sendSuccess(res, "Client created.", client, undefined, 201);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.update(getRouteParam(req.params.id), req.body);
  return sendSuccess(res, "Client updated.", client);
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  await clientService.delete(getRouteParam(req.params.id));
  return sendSuccess(res, "Client deleted.", null);
});

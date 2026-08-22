import { Request, Response } from "express";
import { rentalService } from "../services/rental.service";
import { asyncHandler } from "../utils/async-handler";
import {
  normalizeCreateRentalPayload,
  normalizeUpdateRentalPayload,
} from "../utils/rental-payload.util";
import { getRouteParam } from "../utils/param.util";
import { sendSuccess } from "../utils/response";

export const listRentals = asyncHandler(async (req: Request, res: Response) => {
  const rentals = await rentalService.getAll({
    organizationId: req.organizationId!,
    assetId: req.query.assetId as string | undefined,
    clientId: req.query.clientId as string | undefined,
  });
  return sendSuccess(res, "Rentals retrieved.", rentals);
});

export const getRental = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.getById(getRouteParam(req.params.id), req.organizationId!);
  return sendSuccess(res, "Rental retrieved.", rental);
});

export const getRentalOccupancy = asyncHandler(async (req: Request, res: Response) => {
  const occupancy = await rentalService.getOccupancy(
    req.organizationId!,
    req.query.from as string,
    req.query.to as string,
  );
  return sendSuccess(res, "Rental occupancy retrieved.", occupancy);
});

export const getActiveRentalByAsset = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.getActiveByAsset(
    getRouteParam(req.params.assetId),
    req.organizationId!,
  );
  return sendSuccess(res, "Active rental retrieved.", rental);
});

export const createRental = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.create({
    ...normalizeCreateRentalPayload(req.body),
    organizationId: req.organizationId!,
  });
  return sendSuccess(res, "Rental created.", rental, undefined, 201);
});

export const updateRental = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.update(
    getRouteParam(req.params.id),
    normalizeUpdateRentalPayload(req.body),
    req.organizationId!,
  );
  return sendSuccess(res, "Rental updated.", rental);
});

export const regenerateRentalContract = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.regenerateContract(getRouteParam(req.params.id), req.organizationId!);
  return sendSuccess(res, "Rental contract regenerated.", rental);
});

export const deleteRental = asyncHandler(async (req: Request, res: Response) => {
  await rentalService.delete(getRouteParam(req.params.id), req.organizationId!);
  return sendSuccess(res, "Rental deleted.", null);
});

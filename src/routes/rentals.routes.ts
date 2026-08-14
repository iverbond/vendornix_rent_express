import { Router } from "express";
import * as rentalController from "../controllers/rental.controller";
import { MembershipRole } from "../constants/enums";
import { requireMinRole, requireOrganization } from "../middlewares/organization-context.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createRentalValidator,
  deleteRentalValidator,
  getActiveRentalByAssetValidator,
  getRentalValidator,
  listRentalsValidator,
  regenerateRentalContractValidator,
  updateRentalValidator,
} from "../validators/rental.validators";

const router = Router();

router.use(requireOrganization);

router.get("/", validate(listRentalsValidator), rentalController.listRentals);
router.get(
  "/asset/:assetId/active",
  validate(getActiveRentalByAssetValidator),
  rentalController.getActiveRentalByAsset,
);
router.post(
  "/:id/contract/regenerate",
  requireMinRole(MembershipRole.AGENT),
  validate(regenerateRentalContractValidator),
  rentalController.regenerateRentalContract,
);
router.get("/:id", validate(getRentalValidator), rentalController.getRental);
router.post(
  "/",
  requireMinRole(MembershipRole.AGENT),
  validate(createRentalValidator),
  rentalController.createRental,
);
router.put(
  "/:id",
  requireMinRole(MembershipRole.AGENT),
  validate(updateRentalValidator),
  rentalController.updateRental,
);
router.delete(
  "/:id",
  requireMinRole(MembershipRole.MANAGER),
  validate(deleteRentalValidator),
  rentalController.deleteRental,
);

export default router;

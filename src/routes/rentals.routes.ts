import { Router } from "express";
import * as rentalController from "../controllers/rental.controller";
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

router.get("/", validate(listRentalsValidator), rentalController.listRentals);
router.get(
  "/asset/:assetId/active",
  validate(getActiveRentalByAssetValidator),
  rentalController.getActiveRentalByAsset,
);
router.post(
  "/:id/contract/regenerate",
  validate(regenerateRentalContractValidator),
  rentalController.regenerateRentalContract,
);
router.get("/:id", validate(getRentalValidator), rentalController.getRental);
router.post("/", validate(createRentalValidator), rentalController.createRental);
router.put("/:id", validate(updateRentalValidator), rentalController.updateRental);
router.delete("/:id", validate(deleteRentalValidator), rentalController.deleteRental);

export default router;

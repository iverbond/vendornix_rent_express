import { Router } from "express";
import * as membershipController from "../controllers/membership.controller";
import { validate } from "../middlewares/validation.middleware";
import { createMembershipValidator, deleteMembershipValidator } from "../validators/membership.validators";

const router = Router();

router.get("/", membershipController.listMemberships);
router.post("/", validate(createMembershipValidator), membershipController.createMembership);
router.delete("/:id", validate(deleteMembershipValidator), membershipController.deleteMembership);

export default router;

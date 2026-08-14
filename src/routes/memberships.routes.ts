import { Router } from "express";
import * as membershipController from "../controllers/membership.controller";
import { requireMinRole, requireOrganization } from "../middlewares/organization-context.middleware";
import { MembershipRole } from "../constants/enums";
import { validate } from "../middlewares/validation.middleware";
import {
  createMembershipValidator,
  deleteMembershipValidator,
  updateMembershipRoleValidator,
} from "../validators/membership.validators";

const router = Router();

// No organization selected yet at this point — used to discover which organizations the user belongs to.
router.get("/me", membershipController.listMyMemberships);

router.use(requireOrganization);

router.get("/", membershipController.listMemberships);
router.post(
  "/",
  requireMinRole(MembershipRole.ADMIN),
  validate(createMembershipValidator),
  membershipController.createMembership,
);
router.put(
  "/:id/role",
  requireMinRole(MembershipRole.ADMIN),
  validate(updateMembershipRoleValidator),
  membershipController.updateMembershipRole,
);
router.delete(
  "/:id",
  requireMinRole(MembershipRole.ADMIN),
  validate(deleteMembershipValidator),
  membershipController.deleteMembership,
);

export default router;

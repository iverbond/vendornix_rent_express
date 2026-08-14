import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import { MembershipRole, UserRole } from "../constants/enums";
import { requireOrgAccess } from "../middlewares/organization-access.middleware";
import { requirePlatformRole } from "../middlewares/platform-role.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createOrganizationValidator,
  deleteOrganizationValidator,
  getOrganizationValidator,
  updateOrganizationValidator,
} from "../validators/organization.validators";

const router = Router();

// Directory of every organization on the platform — admin-only. Regular users
// discover their own organizations via `GET /memberships/me` instead.
router.get("/", requirePlatformRole(UserRole.ADMIN), organizationController.listOrganizations);

// Any authenticated user can create an organization — they become its OWNER immediately
// (mirrors the personal organization auto-created at registration).
router.post("/", validate(createOrganizationValidator), organizationController.createOrganization);

// Below: platform admins always pass; otherwise the caller must hold the given role
// in that specific organization.
router.get(
  "/:id",
  validate(getOrganizationValidator),
  requireOrgAccess(MembershipRole.VIEWER),
  organizationController.getOrganization,
);
router.put(
  "/:id",
  validate(updateOrganizationValidator),
  requireOrgAccess(MembershipRole.ADMIN),
  organizationController.updateOrganization,
);
router.delete(
  "/:id",
  validate(deleteOrganizationValidator),
  requireOrgAccess(MembershipRole.OWNER),
  organizationController.deleteOrganization,
);

export default router;

import { NextFunction, Request, Response } from "express";
import { MembershipRole, UserRole } from "../constants/enums";
import { membershipRepository } from "../repositories/membership.repository";
import { AppError } from "../utils/app-error";
import { getRouteParam } from "../utils/param.util";
import { MEMBERSHIP_ROLE_RANK } from "../utils/membership-role-rank.util";

const isPlatformAdmin = (role?: UserRole): boolean =>
  role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

/**
 * For routes shaped `/organizations/:id` (not the `x-organization-id` header flow).
 * Allows platform admins through unconditionally; otherwise requires the caller to
 * hold at least `minRole` in that specific organization. 404 (not 403) when the
 * caller isn't a member at all, to avoid confirming the organization's existence.
 */
export const requireOrgAccess = (minRole: MembershipRole) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (isPlatformAdmin(req.userRole)) {
        next();
        return;
      }

      const organizationId = getRouteParam(req.params.id);
      const membership = await membershipRepository.findByUserAndOrg(req.userId!, organizationId);
      if (!membership) {
        throw new AppError("Organisation introuvable.", 404, "ORGANIZATION_NOT_FOUND");
      }
      if (MEMBERSHIP_ROLE_RANK[membership.role] < MEMBERSHIP_ROLE_RANK[minRole]) {
        throw new AppError("Rôle insuffisant pour cette action.", 403, "INSUFFICIENT_ROLE");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

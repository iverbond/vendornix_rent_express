import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { MembershipRole } from "../constants/enums";
import { membershipRepository } from "../repositories/membership.repository";
import { AppError } from "../utils/app-error";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROLE_RANK: Record<MembershipRole, number> = {
  [MembershipRole.VIEWER]: 0,
  [MembershipRole.AGENT]: 1,
  [MembershipRole.MANAGER]: 2,
  [MembershipRole.ADMIN]: 3,
  [MembershipRole.OWNER]: 4,
};

/**
 * Reads `x-organization-id`, verifies the caller has a membership in that
 * organization, and populates `req.organizationId`/`req.membershipRole`.
 * Must run after `authenticate`.
 */
export const requireOrganization = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const organizationId = req.headers[env.ORGANIZATION_HEADER.toLowerCase()];
    const value = Array.isArray(organizationId) ? organizationId[0] : organizationId;

    if (!value || !UUID_PATTERN.test(value)) {
      throw new AppError(
        `En-tête ${env.ORGANIZATION_HEADER} manquant ou invalide.`,
        400,
        "ORGANIZATION_HEADER_REQUIRED",
      );
    }

    const membership = await membershipRepository.findByUserAndOrg(req.userId!, value);
    if (!membership) {
      throw new AppError("Vous n'êtes pas membre de cette organisation.", 403, "NOT_A_MEMBER");
    }

    req.organizationId = value;
    req.membershipRole = membership.role;
    next();
  } catch (error) {
    next(error);
  }
};

/** Factory: rejects the request unless the caller's role in the current organization is at least `minRole`. Must run after `requireOrganization`. */
export const requireMinRole = (minRole: MembershipRole) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.membershipRole;
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      next(new AppError("Rôle insuffisant pour cette action.", 403, "INSUFFICIENT_ROLE"));
      return;
    }
    next();
  };
};

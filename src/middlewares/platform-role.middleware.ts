import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/enums";
import { AppError } from "../utils/app-error";

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.SUPER_ADMIN]: 2,
};

/** Rejects the request unless the caller's platform-wide role is at least `minRole`. Must run after `authenticate`. */
export const requirePlatformRole = (minRole: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.userRole;
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      next(new AppError("Réservé aux administrateurs.", 403, "INSUFFICIENT_ROLE"));
      return;
    }
    next();
  };
};

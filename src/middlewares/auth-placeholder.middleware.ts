import { NextFunction, Request, Response } from "express";

/**
 * Placeholder for future JWT authentication.
 * V1 routes are open; replace with real auth middleware when JWT is enabled.
 */
export const authPlaceholder = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

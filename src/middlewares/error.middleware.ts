import { NextFunction, Request, Response } from "express";
import { logError } from "../loggers/error.logger";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/response";

const SILENT_NOT_FOUND_PATHS = [/^\/favicon\.ico$/i, /^\/api\/v1\/docs/i, /^\/robots\.txt$/i];

const isSilentNotFound = (req: Request, error: unknown): boolean => {
  if (!(error instanceof AppError) || error.statusCode !== 404) return false;
  return SILENT_NOT_FOUND_PATHS.some((pattern) => pattern.test(req.path));
};

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404, "ROUTE_NOT_FOUND"));
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (!isSilentNotFound(req, error)) {
    logError(error, {
      method: req.method,
      endpoint: req.originalUrl,
      ip: req.ip,
      userId: req.userId,
      organizationId: req.organizationId,
    });
  }

  if (error instanceof AppError) {
    sendError(res, error.message, error.details ?? [], error.code, error.statusCode);
    return;
  }

  sendError(res, "Internal server error.", [{ message: "Unexpected error." }], "INTERNAL_ERROR", 500);
};

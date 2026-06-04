import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const apiRateLimiter: RequestHandler = env.RATE_LIMIT_ENABLED
  ? rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests.",
        errors: [],
        code: "RATE_LIMIT_EXCEEDED",
      },
    })
  : (_req, _res, next) => next();

import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { sendError } from "../utils/response";

export const validate = (chains: readonly ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const result = validationResult(req);
    if (!result.isEmpty()) {
      sendError(res, "Validation failed", result.array(), "VALIDATION_ERROR", 400);
      return;
    }
    next();
  };
};

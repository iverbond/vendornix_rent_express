import { maskSensitiveData, createCategoryLogger } from "./logger";

export interface ErrorLogPayload {
  method?: string;
  endpoint?: string;
  ip?: string;
  userId?: string;
  organizationId?: string;
  body?: unknown;
}

export const errorLogger = createCategoryLogger("errors");

export const logError = (error: unknown, context: ErrorLogPayload = {}): void => {
  const isError = error instanceof Error;
  const payload = maskSensitiveData({
    ...context,
    message: isError ? error.message : "Unknown error",
    stack: isError ? error.stack : undefined,
  });

  errorLogger.error("Unhandled application error", payload as Record<string, unknown>);
};

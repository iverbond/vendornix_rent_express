import { Response } from "express";
import { ApiErrorResponse, ApiSuccessResponse } from "../interfaces/api-response.interface";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  metadata?: Record<string, unknown>,
  statusCode = 200,
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(metadata ? { metadata } : {}),
  });
};

export const sendError = (
  res: Response,
  message: string,
  errors: unknown,
  code?: string,
  statusCode = 500,
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(code ? { code } : {}),
  });
};

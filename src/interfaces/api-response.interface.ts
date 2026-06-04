export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  metadata?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown;
  code?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

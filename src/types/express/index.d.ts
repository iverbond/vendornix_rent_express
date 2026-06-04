import type { RequestFilters } from "../query.types";

declare global {
  namespace Express {
    interface Request {
      /** Reserved for future JWT user context. */
      userId?: string;
      /** Reserved for future multi-tenant organization context. */
      organizationId?: string;
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
      filters?: RequestFilters;
    }
  }
}

export {};

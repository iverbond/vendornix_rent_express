import type { MembershipRole } from "../../constants/enums";
import type { RequestFilters } from "../query.types";

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` from a verified access token. */
      userId?: string;
      /** Set by `requireOrganization` after verifying membership in the `x-organization-id` header. */
      organizationId?: string;
      /** Set alongside `organizationId` — the caller's role within that organization. */
      membershipRole?: MembershipRole;
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

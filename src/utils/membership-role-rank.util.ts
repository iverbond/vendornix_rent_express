import { MembershipRole } from "../constants/enums";

export const MEMBERSHIP_ROLE_RANK: Record<MembershipRole, number> = {
  [MembershipRole.VIEWER]: 0,
  [MembershipRole.AGENT]: 1,
  [MembershipRole.MANAGER]: 2,
  [MembershipRole.ADMIN]: 3,
  [MembershipRole.OWNER]: 4,
};

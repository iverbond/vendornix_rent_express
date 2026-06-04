import { membershipRepository, type CreateMembershipData } from "../repositories/membership.repository";
import { userRepository } from "../repositories/user.repository";
import { organizationRepository } from "../repositories/organization.repository";
import type { MembershipEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class MembershipService {
  async getAll(): Promise<MembershipEntity[]> {
    return membershipRepository.findAll();
  }

  async create(dto: CreateMembershipData): Promise<MembershipEntity> {
    const user = await userRepository.findById(dto.userId);
    if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

    const org = await organizationRepository.findById(dto.organizationId);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");

    const existing = await membershipRepository.findByUserAndOrg(dto.userId, dto.organizationId);
    if (existing) throw new AppError("Membership already exists.", 409, "MEMBERSHIP_EXISTS");

    return membershipRepository.create(dto);
  }

  async delete(id: string): Promise<void> {
    const deleted = await membershipRepository.delete(id);
    if (!deleted) throw new AppError("Membership not found.", 404, "MEMBERSHIP_NOT_FOUND");
  }
}

export const membershipService = new MembershipService();

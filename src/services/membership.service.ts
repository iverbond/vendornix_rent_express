import { membershipRepository, type CreateMembershipData } from "../repositories/membership.repository";
import { userRepository } from "../repositories/user.repository";
import { organizationRepository } from "../repositories/organization.repository";
import { MembershipRole } from "../constants/enums";
import type { MembershipEntity, MembershipWithOrganizationEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class MembershipService {
  async getAll(organizationId: string): Promise<MembershipEntity[]> {
    return membershipRepository.findAllByOrganization(organizationId);
  }

  async getMine(userId: string): Promise<MembershipWithOrganizationEntity[]> {
    return membershipRepository.findAllByUser(userId);
  }

  async create(dto: Omit<CreateMembershipData, "organizationId">, organizationId: string): Promise<MembershipEntity> {
    const user = await userRepository.findById(dto.userId);
    if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");

    const existing = await membershipRepository.findByUserAndOrg(dto.userId, organizationId);
    if (existing) throw new AppError("Membership already exists.", 409, "MEMBERSHIP_EXISTS");

    return membershipRepository.create({ ...dto, organizationId });
  }

  async updateRole(
    id: string,
    organizationId: string,
    actorRole: MembershipRole,
    newRole: MembershipRole,
  ): Promise<MembershipEntity> {
    const membership = await this.assertInOrganization(id, organizationId);
    await this.assertOwnerChangeAllowed(membership, organizationId, actorRole);

    const updated = await membershipRepository.updateRole(id, newRole);
    if (!updated) throw new AppError("Membership not found.", 404, "MEMBERSHIP_NOT_FOUND");
    return updated;
  }

  async delete(id: string, organizationId: string, actorRole: MembershipRole): Promise<void> {
    const membership = await this.assertInOrganization(id, organizationId);
    await this.assertOwnerChangeAllowed(membership, organizationId, actorRole);

    const deleted = await membershipRepository.delete(id);
    if (!deleted) throw new AppError("Membership not found.", 404, "MEMBERSHIP_NOT_FOUND");
  }

  private async assertInOrganization(id: string, organizationId: string): Promise<MembershipEntity> {
    const membership = await membershipRepository.findById(id);
    if (!membership || membership.organizationId !== organizationId) {
      throw new AppError("Membership not found.", 404, "MEMBERSHIP_NOT_FOUND");
    }
    return membership;
  }

  /** Only an OWNER can demote/remove another OWNER, and the last OWNER of an organization can never be removed. */
  private async assertOwnerChangeAllowed(
    membership: MembershipEntity,
    organizationId: string,
    actorRole: MembershipRole,
  ): Promise<void> {
    if (membership.role !== MembershipRole.OWNER) return;

    if (actorRole !== MembershipRole.OWNER) {
      throw new AppError("Seul un propriétaire peut modifier un autre propriétaire.", 403, "INSUFFICIENT_ROLE");
    }

    const members = await membershipRepository.findAllByOrganization(organizationId);
    const ownerCount = members.filter((m) => m.role === MembershipRole.OWNER).length;
    if (ownerCount <= 1) {
      throw new AppError(
        "Impossible de retirer le dernier propriétaire de l'organisation.",
        409,
        "LAST_OWNER",
      );
    }
  }
}

export const membershipService = new MembershipService();

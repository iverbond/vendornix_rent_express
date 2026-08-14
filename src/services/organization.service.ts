import { AssetModel, MembershipModel } from "../database";
import { MembershipRole } from "../constants/enums";
import { membershipRepository } from "../repositories/membership.repository";
import {
  organizationRepository,
  type CreateOrganizationData,
  type UpdateOrganizationData,
} from "../repositories/organization.repository";
import type { OrganizationEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class OrganizationService {
  async getAll(): Promise<OrganizationEntity[]> {
    return organizationRepository.findAll();
  }

  async getById(id: string): Promise<OrganizationEntity> {
    const org = await organizationRepository.findById(id);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
    return org;
  }

  /** Any authenticated user may create an organization — they become its OWNER immediately. */
  async create(dto: CreateOrganizationData, ownerId: string): Promise<OrganizationEntity> {
    const org = await organizationRepository.create(dto);
    await membershipRepository.create({ userId: ownerId, organizationId: org.id, role: MembershipRole.OWNER });
    return org;
  }

  async update(id: string, dto: UpdateOrganizationData): Promise<OrganizationEntity> {
    const org = await organizationRepository.update(id, dto);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
    return org;
  }

  async delete(id: string): Promise<void> {
    const existing = await organizationRepository.findById(id);
    if (!existing) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");

    const [memberCount, assetCount] = await Promise.all([
      MembershipModel.count({ where: { organizationId: id } }),
      AssetModel.count({ where: { organizationId: id } }),
    ]);

    if (memberCount > 0 || assetCount > 0) {
      throw new AppError(
        "Cannot delete an organization that still has members or assets.",
        409,
        "ORGANIZATION_HAS_DEPENDENCIES",
      );
    }

    const deleted = await organizationRepository.delete(id);
    if (!deleted) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
  }
}

export const organizationService = new OrganizationService();

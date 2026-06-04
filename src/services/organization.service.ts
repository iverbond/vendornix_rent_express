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

  async create(dto: CreateOrganizationData): Promise<OrganizationEntity> {
    return organizationRepository.create(dto);
  }

  async update(id: string, dto: UpdateOrganizationData): Promise<OrganizationEntity> {
    const org = await organizationRepository.update(id, dto);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
    return org;
  }

  async delete(id: string): Promise<void> {
    const deleted = await organizationRepository.delete(id);
    if (!deleted) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
  }
}

export const organizationService = new OrganizationService();

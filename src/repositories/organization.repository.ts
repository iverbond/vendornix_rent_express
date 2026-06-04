import { OrganizationModel } from "../database";
import { OrganizationStatus, OrganizationType } from "../constants/enums";
import type { OrganizationEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateOrganizationData {
  name: string;
  type: OrganizationType;
  status?: OrganizationStatus;
}

export interface UpdateOrganizationData {
  name?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
}

class OrganizationRepository {
  async findAll(): Promise<OrganizationEntity[]> {
    const rows = await OrganizationModel.findAll({ order: [["name", "ASC"]] });
    return rows.map((r) => toPublicJson<OrganizationEntity>(r));
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    const row = await OrganizationModel.findByPk(id);
    return row ? toPublicJson<OrganizationEntity>(row) : null;
  }

  async create(data: CreateOrganizationData): Promise<OrganizationEntity> {
    const row = await OrganizationModel.create({
      name: data.name,
      type: data.type,
      status: data.status ?? OrganizationStatus.ACTIVE,
    });
    return toPublicJson<OrganizationEntity>(row);
  }

  async update(id: string, data: UpdateOrganizationData): Promise<OrganizationEntity | null> {
    const row = await OrganizationModel.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return toPublicJson<OrganizationEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await OrganizationModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const organizationRepository = new OrganizationRepository();

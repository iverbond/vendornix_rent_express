import { MembershipModel, OrganizationModel } from "../database";
import { MembershipRole } from "../constants/enums";
import type { MembershipEntity, MembershipWithOrganizationEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateMembershipData {
  userId: string;
  organizationId: string;
  role: MembershipRole;
}

class MembershipRepository {
  async findAllByOrganization(organizationId: string): Promise<MembershipEntity[]> {
    const rows = await MembershipModel.findAll({
      where: { organizationId },
      order: [["createdAt", "DESC"]],
    });
    return rows.map((r) => toPublicJson<MembershipEntity>(r));
  }

  async findAllByUser(userId: string): Promise<MembershipWithOrganizationEntity[]> {
    const rows = await MembershipModel.findAll({
      where: { userId },
      include: [{ model: OrganizationModel, as: "organization" }],
      order: [["createdAt", "DESC"]],
    });
    return rows.map((r) => toPublicJson<MembershipWithOrganizationEntity>(r));
  }

  async findById(id: string): Promise<MembershipEntity | null> {
    const row = await MembershipModel.findByPk(id);
    return row ? toPublicJson<MembershipEntity>(row) : null;
  }

  async findByUserAndOrg(userId: string, organizationId: string): Promise<MembershipEntity | null> {
    const row = await MembershipModel.findOne({ where: { userId, organizationId } });
    return row ? toPublicJson<MembershipEntity>(row) : null;
  }

  async create(data: CreateMembershipData): Promise<MembershipEntity> {
    const row = await MembershipModel.create(data);
    return toPublicJson<MembershipEntity>(row);
  }

  async updateRole(id: string, role: MembershipRole): Promise<MembershipEntity | null> {
    const row = await MembershipModel.findByPk(id);
    if (!row) return null;
    await row.update({ role });
    return toPublicJson<MembershipEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await MembershipModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const membershipRepository = new MembershipRepository();

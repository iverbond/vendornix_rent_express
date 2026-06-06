import { ClientModel } from "../database";
import type { ClientEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateClientData {
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  address?: string | null;
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  address?: string | null;
}

class ClientRepository {
  async findAll(organizationId?: string): Promise<ClientEntity[]> {
    const rows = await ClientModel.findAll({
      where: organizationId ? { organizationId } : undefined,
      order: [
        ["lastName", "ASC"],
        ["firstName", "ASC"],
      ],
    });
    return rows.map((r) => toPublicJson<ClientEntity>(r));
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const row = await ClientModel.findByPk(id);
    return row ? toPublicJson<ClientEntity>(row) : null;
  }

  async create(data: CreateClientData): Promise<ClientEntity> {
    const row = await ClientModel.create({
      organizationId: data.organizationId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      nationalId: data.nationalId?.trim() || null,
      address: data.address?.trim() || null,
    });
    return toPublicJson<ClientEntity>(row);
  }

  async update(id: string, data: UpdateClientData): Promise<ClientEntity | null> {
    const row = await ClientModel.findByPk(id);
    if (!row) return null;
    await row.update({
      ...(data.firstName !== undefined ? { firstName: data.firstName.trim() } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName.trim() } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.nationalId !== undefined ? { nationalId: data.nationalId?.trim() || null } : {}),
      ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
    });
    return toPublicJson<ClientEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await ClientModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const clientRepository = new ClientRepository();

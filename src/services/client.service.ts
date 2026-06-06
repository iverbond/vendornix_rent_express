import {
  clientRepository,
  type CreateClientData,
  type UpdateClientData,
} from "../repositories/client.repository";
import { organizationRepository } from "../repositories/organization.repository";
import type { ClientEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class ClientService {
  async getAll(organizationId?: string): Promise<ClientEntity[]> {
    return clientRepository.findAll(organizationId);
  }

  async getById(id: string): Promise<ClientEntity> {
    const client = await clientRepository.findById(id);
    if (!client) throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
    return client;
  }

  async create(dto: CreateClientData): Promise<ClientEntity> {
    await this.assertOrganization(dto.organizationId);
    return clientRepository.create(dto);
  }

  async update(id: string, dto: UpdateClientData): Promise<ClientEntity> {
    const updated = await clientRepository.update(id, dto);
    if (!updated) throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await clientRepository.delete(id);
    if (!deleted) throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
  }

  private async assertOrganization(organizationId: string): Promise<void> {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
  }
}

export const clientService = new ClientService();

import { AssetStatus, RentalStatus } from "../constants/enums";
import { assetRepository } from "../repositories/asset.repository";
import { clientRepository } from "../repositories/client.repository";
import {
  rentalRepository,
  type CreateRentalData,
  type UpdateRentalData,
} from "../repositories/rental.repository";
import { organizationRepository } from "../repositories/organization.repository";
import type { RentalEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";
import { buildContractNumber, generateRentalContract } from "./rental-contract.service";

class RentalService {
  async getAll(filters?: {
    organizationId?: string;
    assetId?: string;
    clientId?: string;
  }): Promise<RentalEntity[]> {
    return rentalRepository.findAll(filters);
  }

  async getById(id: string): Promise<RentalEntity> {
    const rental = await rentalRepository.findById(id);
    if (!rental) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");
    return rental;
  }

  async getActiveByAsset(assetId: string): Promise<RentalEntity | null> {
    return rentalRepository.findActiveByAsset(assetId);
  }

  async create(dto: CreateRentalData): Promise<RentalEntity> {
    const context = await this.loadContractContext(dto.organizationId, dto.assetId, dto.clientId);
    await this.validateRentalPeriod(dto.startDate, dto.endDate);
    await this.assertNoActiveRental(dto.assetId, dto.status);

    const rental = await rentalRepository.create(dto);
    const withContract = await this.attachGeneratedContract(rental, context);

    if (withContract.status === RentalStatus.ACTIVE) {
      await assetRepository.update(dto.assetId, { status: AssetStatus.RENTED });
    }

    return withContract;
  }

  async update(id: string, dto: UpdateRentalData): Promise<RentalEntity> {
    const existing = await rentalRepository.findById(id);
    if (!existing) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate !== undefined ? dto.endDate : existing.endDate;
    await this.validateRentalPeriod(startDate, endDate ?? null);

    const updated = await rentalRepository.update(id, dto);
    if (!updated) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");

    if (dto.status) {
      await this.syncAssetStatus(updated.assetId);
    }

    return updated;
  }

  async regenerateContract(id: string): Promise<RentalEntity> {
    const rental = await this.getById(id);
    const context = await this.loadContractContext(
      rental.organizationId,
      rental.assetId,
      rental.clientId,
    );
    const contractNumber = rental.contractNumber ?? buildContractNumber(rental.id);
    const contractContent = generateRentalContract({
      rental,
      organization: context.organization,
      asset: context.asset,
      client: context.client,
      contractNumber,
    });

    const updated = await rentalRepository.update(id, { contractNumber, contractContent });
    if (!updated) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await rentalRepository.findById(id);
    if (!existing) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");

    const deleted = await rentalRepository.delete(id);
    if (!deleted) throw new AppError("Rental not found.", 404, "RENTAL_NOT_FOUND");

    await this.syncAssetStatus(existing.assetId);
  }

  private async attachGeneratedContract(
    rental: RentalEntity,
    context: Awaited<ReturnType<typeof this.loadContractContext>>,
  ): Promise<RentalEntity> {
    const contractNumber = buildContractNumber(rental.id);
    const contractContent = generateRentalContract({
      rental,
      organization: context.organization,
      asset: context.asset,
      client: context.client,
      contractNumber,
    });

    const updated = await rentalRepository.update(rental.id, { contractNumber, contractContent });
    return updated ?? rental;
  }

  private async loadContractContext(organizationId: string, assetId: string, clientId: string) {
    await this.assertOrganization(organizationId);
    const [organization, asset, client] = await Promise.all([
      organizationRepository.findById(organizationId),
      assetRepository.findById(assetId),
      clientRepository.findById(clientId),
    ]);

    if (!organization) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
    if (!asset || asset.organizationId !== organizationId) {
      throw new AppError("Asset not found.", 404, "ASSET_NOT_FOUND");
    }
    if (!asset.rentable) throw new AppError("Asset is not rentable.", 400, "ASSET_NOT_RENTABLE");
    if (!client || client.organizationId !== organizationId) {
      throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
    }

    return { organization, asset, client };
  }

  private async validateRentalPeriod(startDate: string, endDate: string | null | undefined): Promise<void> {
    if (endDate && endDate < startDate) {
      throw new AppError("End date must be after start date.", 400, "INVALID_RENTAL_PERIOD");
    }
  }

  private async assertNoActiveRental(assetId: string, status?: RentalStatus): Promise<void> {
    if (status === RentalStatus.ACTIVE) {
      const existing = await rentalRepository.findActiveByAsset(assetId);
      if (existing) {
        throw new AppError("Asset already has an active rental.", 409, "ASSET_ALREADY_RENTED");
      }
    }
  }

  private async syncAssetStatus(assetId: string): Promise<void> {
    const active = await rentalRepository.findActiveByAsset(assetId);
    await assetRepository.update(assetId, {
      status: active ? AssetStatus.RENTED : AssetStatus.AVAILABLE,
    });
  }

  private async assertOrganization(organizationId: string): Promise<void> {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new AppError("Organization not found.", 404, "ORGANIZATION_NOT_FOUND");
  }
}

export const rentalService = new RentalService();

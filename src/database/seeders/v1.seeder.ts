import {
  AssetStatus,
  AssetType,
  CurrencyCode,
  MembershipRole,
  OrganizationStatus,
  OrganizationType,
  UserStatus,
} from "../../constants/enums";
import { AppSettingsModel, AssetModel, MembershipModel, OrganizationModel, UserModel } from "../index";
import { passwordService } from "../../services/password.service";

const DEFAULT_PASSWORD = "Vendornix123!";

export const runV1Seeders = async (): Promise<void> => {
  const settingsCount = await AppSettingsModel.count();
  if (settingsCount === 0) {
    await AppSettingsModel.create({
      exchangeRate: "3000",
      defaultCurrency: CurrencyCode.CDF,
    });
  }

  const userCount = await UserModel.count();
  if (userCount > 0) return;

  const password = await passwordService.hashPassword(DEFAULT_PASSWORD);

  const bahati = await UserModel.create({
    firstName: "Bahati",
    lastName: "Yves",
    email: "bahati@vendornix.local",
    phone: null,
    password,
    status: UserStatus.ACTIVE,
  });

  const pascal = await UserModel.create({
    firstName: "Pascal",
    lastName: "Pascal",
    email: "pascal@vendornix.local",
    phone: null,
    password,
    status: UserStatus.ACTIVE,
  });

  const vendornix = await OrganizationModel.create({
    name: "Vendornix",
    type: OrganizationType.COMPANY,
    status: OrganizationStatus.ACTIVE,
  });

  const pascalOrg = await OrganizationModel.create({
    name: "Pascal",
    type: OrganizationType.INDIVIDUAL,
    status: OrganizationStatus.ACTIVE,
  });

  await MembershipModel.create({
    userId: bahati.id,
    organizationId: vendornix.id,
    role: MembershipRole.OWNER,
  });

  await MembershipModel.create({
    userId: pascal.id,
    organizationId: pascalOrg.id,
    role: MembershipRole.OWNER,
  });

  const jeep = await AssetModel.create({
    organizationId: vendornix.id,
    parentAssetId: null,
    name: "Jeep",
    description: null,
    assetType: AssetType.VEHICLE,
    rentable: true,
    status: AssetStatus.AVAILABLE,
  });

  await AssetModel.create({
    organizationId: vendornix.id,
    parentAssetId: jeep.id,
    name: "Prado",
    description: null,
    assetType: AssetType.VEHICLE,
    rentable: true,
    status: AssetStatus.AVAILABLE,
  });

  const maison = await AssetModel.create({
    organizationId: vendornix.id,
    parentAssetId: null,
    name: "Maison Centre-ville",
    description: null,
    assetType: AssetType.HOUSE,
    rentable: true,
    status: AssetStatus.AVAILABLE,
  });

  const immeuble = await AssetModel.create({
    organizationId: vendornix.id,
    parentAssetId: maison.id,
    name: "Immeuble Horizon",
    description: null,
    assetType: AssetType.BUILDING,
    rentable: false,
    status: AssetStatus.AVAILABLE,
  });

  for (const name of ["Appartement A1", "Appartement A2", "Appartement A3", "Appartement A4"]) {
    await AssetModel.create({
      organizationId: vendornix.id,
      parentAssetId: immeuble.id,
      name,
      description: null,
      assetType: AssetType.APARTMENT,
      rentable: true,
      status: AssetStatus.AVAILABLE,
    });
  }

  await AssetModel.create({
    organizationId: pascalOrg.id,
    parentAssetId: null,
    name: "Audi",
    description: null,
    assetType: AssetType.VEHICLE,
    rentable: true,
    status: AssetStatus.AVAILABLE,
  });
};

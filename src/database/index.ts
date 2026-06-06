import { AppSettingsModel } from "./models/app-settings.model";
import { AssetImageModel } from "./models/asset-image.model";
import { AssetModel } from "./models/asset.model";
import { ClientModel } from "./models/client.model";
import { MembershipModel } from "./models/membership.model";
import { OrganizationModel } from "./models/organization.model";
import { PasswordResetTokenModel } from "./models/password-reset-token.model";
import { RentalModel } from "./models/rental.model";
import { UserModel } from "./models/user.model";

export const initModels = (): void => {
  UserModel.hasMany(MembershipModel, { foreignKey: "userId", as: "memberships" });
  MembershipModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

  UserModel.hasMany(PasswordResetTokenModel, { foreignKey: "userId", as: "passwordResetTokens" });
  PasswordResetTokenModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

  OrganizationModel.hasMany(MembershipModel, { foreignKey: "organizationId", as: "memberships" });
  MembershipModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  OrganizationModel.hasMany(AssetModel, { foreignKey: "organizationId", as: "assets" });
  AssetModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  OrganizationModel.hasMany(ClientModel, { foreignKey: "organizationId", as: "clients" });
  ClientModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  OrganizationModel.hasMany(RentalModel, { foreignKey: "organizationId", as: "rentals" });
  RentalModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  AssetModel.hasMany(AssetModel, { foreignKey: "parentAssetId", as: "children" });
  AssetModel.belongsTo(AssetModel, { foreignKey: "parentAssetId", as: "parent" });

  AssetModel.hasMany(AssetImageModel, { foreignKey: "assetId", as: "images" });
  AssetImageModel.belongsTo(AssetModel, { foreignKey: "assetId", as: "asset" });

  AssetModel.hasMany(RentalModel, { foreignKey: "assetId", as: "rentals" });
  RentalModel.belongsTo(AssetModel, { foreignKey: "assetId", as: "asset" });

  ClientModel.hasMany(RentalModel, { foreignKey: "clientId", as: "rentals" });
  RentalModel.belongsTo(ClientModel, { foreignKey: "clientId", as: "client" });
};

export {
  UserModel,
  OrganizationModel,
  MembershipModel,
  AssetModel,
  AssetImageModel,
  AppSettingsModel,
  PasswordResetTokenModel,
  ClientModel,
  RentalModel,
};

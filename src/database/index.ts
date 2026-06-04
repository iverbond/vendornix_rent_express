import { AppSettingsModel } from "./models/app-settings.model";
import { AssetModel } from "./models/asset.model";
import { MembershipModel } from "./models/membership.model";
import { OrganizationModel } from "./models/organization.model";
import { UserModel } from "./models/user.model";

export const initModels = (): void => {
  UserModel.hasMany(MembershipModel, { foreignKey: "userId", as: "memberships" });
  MembershipModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

  OrganizationModel.hasMany(MembershipModel, { foreignKey: "organizationId", as: "memberships" });
  MembershipModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  OrganizationModel.hasMany(AssetModel, { foreignKey: "organizationId", as: "assets" });
  AssetModel.belongsTo(OrganizationModel, { foreignKey: "organizationId", as: "organization" });

  AssetModel.hasMany(AssetModel, { foreignKey: "parentAssetId", as: "children" });
  AssetModel.belongsTo(AssetModel, { foreignKey: "parentAssetId", as: "parent" });
};

export { UserModel, OrganizationModel, MembershipModel, AssetModel, AppSettingsModel };

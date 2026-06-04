import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { AssetStatus, AssetType } from "../../constants/enums";

export class AssetModel extends Model<InferAttributes<AssetModel>, InferCreationAttributes<AssetModel>> {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare parentAssetId: string | null;
  declare name: string;
  declare description: string | null;
  declare assetType: AssetType;
  declare rentable: boolean;
  declare status: AssetStatus;
  declare priceCdf: string | null;
  declare priceUsd: string | null;
  declare location: string | null;
  declare attributes: Record<string, unknown> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

AssetModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false, field: "organization_id" },
    parentAssetId: { type: DataTypes.UUID, allowNull: true, field: "parent_asset_id" },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    assetType: {
      type: DataTypes.ENUM(...Object.values(AssetType)),
      allowNull: false,
      field: "asset_type",
    },
    rentable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    status: {
      type: DataTypes.ENUM(...Object.values(AssetStatus)),
      allowNull: false,
      defaultValue: AssetStatus.AVAILABLE,
    },
    priceCdf: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "price_cdf" },
    priceUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "price_usd" },
    location: { type: DataTypes.STRING(255), allowNull: true },
    attributes: { type: DataTypes.JSON, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "assets" },
);

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class AssetImageModel extends Model<
  InferAttributes<AssetImageModel>,
  InferCreationAttributes<AssetImageModel>
> {
  declare id: CreationOptional<string>;
  declare assetId: string;
  declare fileName: string;
  declare originalName: string;
  declare mimeType: string;
  declare caption: string | null;
  declare isPrimary: boolean;
  declare sortOrder: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

AssetImageModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assetId: { type: DataTypes.UUID, allowNull: false, field: "asset_id" },
    fileName: { type: DataTypes.STRING(255), allowNull: false, field: "file_name" },
    originalName: { type: DataTypes.STRING(255), allowNull: false, field: "original_name" },
    mimeType: { type: DataTypes.STRING(100), allowNull: false, field: "mime_type" },
    caption: { type: DataTypes.STRING(255), allowNull: true },
    isPrimary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_primary" },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "sort_order" },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "asset_images", paranoid: true },
);

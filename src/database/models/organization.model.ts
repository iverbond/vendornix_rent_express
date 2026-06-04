import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { OrganizationStatus, OrganizationType } from "../../constants/enums";

export class OrganizationModel extends Model<
  InferAttributes<OrganizationModel>,
  InferCreationAttributes<OrganizationModel>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare type: OrganizationType;
  declare status: OrganizationStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

OrganizationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    type: {
      type: DataTypes.ENUM(...Object.values(OrganizationType)),
      allowNull: false,
      defaultValue: OrganizationType.OTHER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrganizationStatus)),
      allowNull: false,
      defaultValue: OrganizationStatus.ACTIVE,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "organizations" },
);

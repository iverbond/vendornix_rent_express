import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ClientModel extends Model<InferAttributes<ClientModel>, InferCreationAttributes<ClientModel>> {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string | null;
  declare phone: string | null;
  declare nationalId: string | null;
  declare address: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

ClientModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false, field: "organization_id" },
    firstName: { type: DataTypes.STRING(120), allowNull: false, field: "first_name" },
    lastName: { type: DataTypes.STRING(120), allowNull: false, field: "last_name" },
    email: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    nationalId: { type: DataTypes.STRING(80), allowNull: true, field: "national_id" },
    address: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "clients", paranoid: true },
);

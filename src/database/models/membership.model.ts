import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { MembershipRole } from "../../constants/enums";

export class MembershipModel extends Model<
  InferAttributes<MembershipModel>,
  InferCreationAttributes<MembershipModel>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare organizationId: string;
  declare role: MembershipRole;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

MembershipModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },
    organizationId: { type: DataTypes.UUID, allowNull: false, field: "organization_id" },
    role: {
      type: DataTypes.ENUM(...Object.values(MembershipRole)),
      allowNull: false,
      defaultValue: MembershipRole.VIEWER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "memberships",
    indexes: [{ unique: true, fields: ["user_id", "organization_id"] }],
  },
);

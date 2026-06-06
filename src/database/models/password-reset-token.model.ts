import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class PasswordResetTokenModel extends Model<
  InferAttributes<PasswordResetTokenModel>,
  InferCreationAttributes<PasswordResetTokenModel>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare usedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PasswordResetTokenModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false, field: "user_id" },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, field: "token_hash" },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: "expires_at" },
    usedAt: { type: DataTypes.DATE, allowNull: true, field: "used_at" },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "password_reset_tokens",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["token_hash"] },
      { fields: ["expires_at"] },
    ],
  },
);

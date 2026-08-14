import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { UserRole, UserStatus } from "../../constants/enums";

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string | null;
  declare password: string;
  declare status: UserStatus;
  declare role: UserRole;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING(120), allowNull: false, field: "first_name" },
    lastName: { type: DataTypes.STRING(120), allowNull: false, field: "last_name" },
    // Uniqueness declared once here (not duplicated in `indexes` below) — a duplicate
    // declaration previously caused `sync({ alter: true })` to accumulate a new index
    // on every dev restart until MySQL's 64-key-per-table limit was hit.
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
  },
);

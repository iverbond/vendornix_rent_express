import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { CurrencyCode } from "../../constants/enums";

export class AppSettingsModel extends Model<
  InferAttributes<AppSettingsModel>,
  InferCreationAttributes<AppSettingsModel>
> {
  declare id: CreationOptional<string>;
  declare exchangeRate: string;
  declare defaultCurrency: CurrencyCode;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

AppSettingsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exchangeRate: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: "exchange_rate" },
    defaultCurrency: {
      type: DataTypes.ENUM(...Object.values(CurrencyCode)),
      allowNull: false,
      defaultValue: CurrencyCode.CDF,
      field: "default_currency",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "app_settings" },
);

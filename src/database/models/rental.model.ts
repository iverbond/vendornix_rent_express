import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { CurrencyCode, PricingPeriod, RentalStatus } from "../../constants/enums";

export class RentalModel extends Model<InferAttributes<RentalModel>, InferCreationAttributes<RentalModel>> {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare assetId: string;
  declare clientId: string;
  declare status: RentalStatus;
  declare startDate: string;
  declare endDate: string | null;
  declare pricingPeriod: PricingPeriod;
  declare amountCdf: string;
  declare amountUsd: string;
  declare billingCurrency: CurrencyCode;
  declare vatRate: string;
  declare vatIncluded: boolean;
  declare depositCdf: string | null;
  declare depositUsd: string | null;
  declare notes: string | null;
  declare contractNumber: string | null;
  declare contractContent: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

RentalModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false, field: "organization_id" },
    assetId: { type: DataTypes.UUID, allowNull: false, field: "asset_id" },
    clientId: { type: DataTypes.UUID, allowNull: false, field: "client_id" },
    status: {
      type: DataTypes.ENUM(...Object.values(RentalStatus)),
      allowNull: false,
      defaultValue: RentalStatus.ACTIVE,
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, field: "start_date" },
    endDate: { type: DataTypes.DATEONLY, allowNull: true, field: "end_date" },
    pricingPeriod: {
      type: DataTypes.ENUM(...Object.values(PricingPeriod)),
      allowNull: false,
      field: "pricing_period",
    },
    amountCdf: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "amount_cdf" },
    amountUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "amount_usd" },
    billingCurrency: {
      type: DataTypes.ENUM(...Object.values(CurrencyCode)),
      allowNull: false,
      field: "billing_currency",
    },
    vatRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: "16.00", field: "vat_rate" },
    vatIncluded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "vat_included" },
    depositCdf: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "deposit_cdf" },
    depositUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "deposit_usd" },
    notes: { type: DataTypes.TEXT, allowNull: true },
    contractNumber: { type: DataTypes.STRING(40), allowNull: true, field: "contract_number" },
    contractContent: { type: DataTypes.TEXT, allowNull: true, field: "contract_content" },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "rentals", paranoid: true },
);

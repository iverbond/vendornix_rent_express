import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../../config/database";
import { CurrencyCode, PaymentStatus } from "../../constants/enums";

export class PaymentModel extends Model<InferAttributes<PaymentModel>, InferCreationAttributes<PaymentModel>> {
  declare id: CreationOptional<string>;
  declare organizationId: string;
  declare rentalId: string;
  declare periodStart: string;
  declare periodEnd: string;
  declare dueDate: string;
  declare dueAmountCdf: string;
  declare dueAmountUsd: string;
  declare currency: CurrencyCode;
  declare status: PaymentStatus;
  declare paidAt: Date | null;
  declare paidAmountCdf: string | null;
  declare paidAmountUsd: string | null;
  declare method: string | null;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

PaymentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false, field: "organization_id" },
    rentalId: { type: DataTypes.UUID, allowNull: false, field: "rental_id" },
    periodStart: { type: DataTypes.DATEONLY, allowNull: false, field: "period_start" },
    periodEnd: { type: DataTypes.DATEONLY, allowNull: false, field: "period_end" },
    dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: "due_date" },
    dueAmountCdf: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "due_amount_cdf" },
    dueAmountUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "due_amount_usd" },
    currency: { type: DataTypes.ENUM(...Object.values(CurrencyCode)), allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    paidAt: { type: DataTypes.DATE, allowNull: true, field: "paid_at" },
    paidAmountCdf: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "paid_amount_cdf" },
    paidAmountUsd: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: "paid_amount_usd" },
    method: { type: DataTypes.STRING(60), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "payments", paranoid: true },
);

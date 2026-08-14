import {
  AssetStatus,
  AssetType,
  CurrencyCode,
  MembershipRole,
  OrganizationStatus,
  OrganizationType,
  PaymentStatus,
  PricingPeriod,
  RentalStatus,
  UserRole,
  UserStatus,
} from "../constants/enums";

export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationEntity {
  id: string;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipEntity {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipWithOrganizationEntity extends MembershipEntity {
  organization: OrganizationEntity;
}

export interface AssetEntity {
  id: string;
  organizationId: string;
  parentAssetId: string | null;
  name: string;
  description: string | null;
  assetType: AssetType;
  rentable: boolean;
  status: AssetStatus;
  priceCdf: string | null;
  priceUsd: string | null;
  location: string | null;
  attributes: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettingsEntity {
  id: string;
  exchangeRate: string;
  defaultCurrency: CurrencyCode;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetImageEntity {
  id: string;
  assetId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  caption: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetTreeNode extends AssetEntity {
  children: AssetTreeNode[];
}

export interface ClientEntity {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nationalId: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalEntity {
  id: string;
  organizationId: string;
  assetId: string;
  clientId: string;
  status: RentalStatus;
  startDate: string;
  endDate: string | null;
  pricingPeriod: PricingPeriod;
  amountCdf: string;
  amountUsd: string;
  billingCurrency: CurrencyCode;
  vatRate: string;
  vatIncluded: boolean;
  depositCdf: string | null;
  depositUsd: string | null;
  notes: string | null;
  contractNumber: string | null;
  contractContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentEntity {
  id: string;
  organizationId: string;
  rentalId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  dueAmountCdf: string;
  dueAmountUsd: string;
  currency: CurrencyCode;
  status: PaymentStatus;
  paidAt: Date | null;
  paidAmountCdf: string | null;
  paidAmountUsd: string | null;
  method: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithComputed extends PaymentEntity {
  isLate: boolean;
}

export interface PaymentReminderEntity extends PaymentWithComputed {
  daysOffset: number;
  dueSoon: boolean;
  assetName: string;
  clientName: string;
  contractNumber: string | null;
  pricingPeriod: PricingPeriod;
}

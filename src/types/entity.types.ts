import { AssetStatus, AssetType, CurrencyCode, MembershipRole, OrganizationStatus, OrganizationType, UserStatus } from "../constants/enums";

export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
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

export interface AssetTreeNode extends AssetEntity {
  children: AssetTreeNode[];
}

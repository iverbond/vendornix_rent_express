export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum OrganizationType {
  INDIVIDUAL = "INDIVIDUAL",
  COMPANY = "COMPANY",
  AGENCY = "AGENCY",
  HOTEL = "HOTEL",
  OTHER = "OTHER",
}

export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum MembershipRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  AGENT = "AGENT",
  VIEWER = "VIEWER",
}

export enum AssetType {
  VEHICLE = "VEHICLE",
  HOUSE = "HOUSE",
  BUILDING = "BUILDING",
  APARTMENT = "APARTMENT",
  HOTEL = "HOTEL",
  ROOM = "ROOM",
  OFFICE = "OFFICE",
  LAND = "LAND",
  SHOP = "SHOP",
  OTHER = "OTHER",
}

export enum AssetStatus {
  AVAILABLE = "AVAILABLE",
  RENTED = "RENTED",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export enum CurrencyCode {
  CDF = "CDF",
  USD = "USD",
}

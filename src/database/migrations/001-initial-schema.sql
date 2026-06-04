-- Vendornix Rent V1 schema (reference migration)
-- Apply via DB_SYNC or run manually on MySQL/MariaDB

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED','PENDING') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('INDIVIDUAL','COMPANY','AGENCY','HOTEL','OTHER') NOT NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  role ENUM('OWNER','ADMIN','MANAGER','AGENT','VIEWER') NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  UNIQUE KEY memberships_user_org (user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS assets (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  parent_asset_id CHAR(36) NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  asset_type ENUM('VEHICLE','HOUSE','BUILDING','APARTMENT','HOTEL','ROOM','OFFICE','LAND','SHOP','OTHER') NOT NULL,
  rentable TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('AVAILABLE','RENTED','RESERVED','MAINTENANCE','INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
  price_cdf DECIMAL(18,2) NULL,
  price_usd DECIMAL(18,2) NULL,
  location VARCHAR(255) NULL,
  attributes JSON NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id CHAR(36) PRIMARY KEY,
  exchange_rate DECIMAL(18,4) NOT NULL,
  default_currency ENUM('CDF','USD') NOT NULL DEFAULT 'CDF',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

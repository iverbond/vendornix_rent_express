-- Rentals & clients (reference migration)

CREATE TABLE IF NOT EXISTS clients (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(40) NULL,
  national_id VARCHAR(80) NULL,
  address VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS rentals (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  asset_id CHAR(36) NOT NULL,
  client_id CHAR(36) NOT NULL,
  status ENUM('DRAFT','ACTIVE','ENDED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  start_date DATE NOT NULL,
  end_date DATE NULL,
  pricing_period ENUM('HOURLY','DAILY','MONTHLY','YEARLY') NOT NULL,
  amount_cdf DECIMAL(18,2) NOT NULL,
  amount_usd DECIMAL(18,2) NOT NULL,
  billing_currency ENUM('CDF','USD') NOT NULL DEFAULT 'CDF',
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  vat_included TINYINT(1) NOT NULL DEFAULT 0,
  deposit_cdf DECIMAL(18,2) NULL,
  deposit_usd DECIMAL(18,2) NULL,
  notes TEXT NULL,
  contract_number VARCHAR(40) NULL,
  contract_content TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL
);

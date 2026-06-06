import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
};

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development") as "development" | "test" | "production",
  PORT: parseNumber(process.env.PORT, 3000),
  API_PREFIX: getEnv("API_PREFIX", "/api"),
  APP_NAME: getEnv("APP_NAME", "Vendornix Rent API"),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "*"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:4200"),
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL ?? `http://localhost:${parseNumber(process.env.PORT, 3000)}`,
  TRUST_PROXY: process.env.TRUST_PROXY ?? "false",

  DB_HOST: getEnv("DB_HOST", "localhost"),
  DB_PORT: parseNumber(process.env.DB_PORT, 3306),
  DB_NAME: getEnv("DB_NAME", "vendornix_rent"),
  DB_USER: getEnv("DB_USER", "root"),
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_LOGGING: parseBoolean(process.env.DB_LOGGING, false),
  DB_SYNC_ENABLED: parseBoolean(process.env.DB_SYNC_ENABLED, true),
  DB_SYNC_ALTER: parseBoolean(process.env.DB_SYNC_ALTER, false),

  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
  LOG_RETENTION_DAYS: parseNumber(process.env.LOG_RETENTION_DAYS, 14),
  LOG_MAX_SIZE: getEnv("LOG_MAX_SIZE", "20m"),
  LOG_ZIPPED_ARCHIVE: parseBoolean(process.env.LOG_ZIPPED_ARCHIVE, true),
  LOG_CONSOLE_ENABLED: parseBoolean(process.env.LOG_CONSOLE_ENABLED, true),

  RATE_LIMIT_ENABLED: parseBoolean(process.env.RATE_LIMIT_ENABLED, true),
  RATE_LIMIT_MAX: parseNumber(process.env.RATE_LIMIT_MAX, 10_000),
  RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),

  ORGANIZATION_HEADER: getEnv("ORGANIZATION_HEADER", "x-organization-id"),

  UPLOAD_DIR: getEnv("UPLOAD_DIR", "uploads"),
  UPLOAD_MAX_FILE_SIZE_MB: parseNumber(process.env.UPLOAD_MAX_FILE_SIZE_MB, 5),
  UPLOAD_MAX_IMAGES_PER_ASSET: parseNumber(process.env.UPLOAD_MAX_IMAGES_PER_ASSET, 20),

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: parseNumber(process.env.SMTP_PORT, 587),
  SMTP_SECURE:
    process.env.SMTP_SECURE !== undefined
      ? parseBoolean(process.env.SMTP_SECURE, false)
      : parseNumber(process.env.SMTP_PORT, 587) === 465,
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: (process.env.SMTP_PASS ?? "").replace(/^["']|["']$/g, ""),
  SMTP_FROM:
    process.env.SMTP_FROM ??
    process.env.EMAIL_FROM ??
    "LocaPro <noreply@locapro.local>",
  PASSWORD_RESET_EXPIRY_MINUTES: parseNumber(process.env.PASSWORD_RESET_EXPIRY_MINUTES, 60),
} as const;

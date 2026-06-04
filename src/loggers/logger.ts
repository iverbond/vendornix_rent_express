import fs from "fs";
import path from "path";
import { inspect } from "util";
import { createLogger, format, transports, Logger } from "winston";
import type { transport } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/env";

export type LogCategory = "requests" | "errors" | "auth" | "uploads" | "emails" | "system";

const runtimeLogsRoot = path.join(process.cwd(), "logs");
const sourceLogsRoot = path.join(process.cwd(), "src", "loggers", "logs");
const categories: LogCategory[] = ["requests", "errors", "auth", "uploads", "emails", "system"];

const sensitiveKeyPattern = /(password|token|secret|authorization|api[_-]?key|credential)/i;

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const initializeLogFolders = (): void => {
  ensureDir(runtimeLogsRoot);
  ensureDir(sourceLogsRoot);
  categories.forEach((category) => {
    ensureDir(path.join(runtimeLogsRoot, category));
    ensureDir(path.join(sourceLogsRoot, category));
  });
};

const maskSensitiveData = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(maskSensitiveData);
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (sensitiveKeyPattern.test(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = maskSensitiveData(nestedValue);
      }
    });
    return sanitized;
  }

  return value;
};

const devFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const { timestamp, level, message, stack, ...rest } = info;
    const meta = Object.keys(rest).length > 0 ? ` ${inspect(maskSensitiveData(rest), { depth: 4, colors: true })}` : "";
    const stackOutput = stack ? `\n${stack}` : "";
    return `[${timestamp}] ${level} ${message}${meta}${stackOutput}`;
  }),
);

const prodFormat = format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.errors({ stack: true }), format.json());

const categoryTransport = (category: LogCategory, level: string): DailyRotateFile =>
  new DailyRotateFile({
    dirname: path.join(runtimeLogsRoot, category),
    filename: "%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: env.LOG_ZIPPED_ARCHIVE,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: `${env.LOG_RETENTION_DAYS}d`,
    level,
  });

initializeLogFolders();

export const createCategoryLogger = (category: LogCategory, level = env.LOG_LEVEL): Logger => {
  const activeTransports: transport[] = [categoryTransport(category, level)];

  if (env.LOG_CONSOLE_ENABLED && env.NODE_ENV !== "test") {
    activeTransports.push(
      new transports.Console({
        level: env.NODE_ENV === "development" ? "debug" : "warn",
      }),
    );
  }

  return createLogger({
    level,
    format: env.NODE_ENV === "development" ? devFormat : prodFormat,
    defaultMeta: { category, service: "vendornix-rent-api" },
    transports: activeTransports,
    exitOnError: false,
  });
};

export const logger = createCategoryLogger("system");
export { maskSensitiveData };

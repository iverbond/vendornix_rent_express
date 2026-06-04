import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database";
import { logger } from "../loggers/logger";

/**
 * Maps pre-V1 schema/data to V1 before Sequelize sync({ alter: true }).
 * Safe to run on empty or already-migrated databases.
 */
export const runLegacySchemaCleanup = async (): Promise<void> => {
  const tables = (await sequelize.query<{ name: string }>(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN ('organizations', 'users', 'organization_users', 'assets', 'asset_images')`,
    { type: QueryTypes.SELECT },
  )) as Array<{ name: string }>;

  const tableNames = new Set(tables.map((t) => t.name));

  if (tableNames.has("organizations")) {
    await normalizeOrganizationTypes();
  }

  if (tableNames.has("users")) {
    await normalizeUserPasswordColumn();
  }

  if (tableNames.has("assets")) {
    await normalizeAssetsTable();
  }
};

const getTableColumns = async (tableName: string): Promise<Set<string>> => {
  const columns = (await sequelize.query<{ columnName: string }>(
    `SELECT COLUMN_NAME AS columnName
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
    { type: QueryTypes.SELECT, replacements: { table: tableName } },
  )) as Array<{ columnName: string }>;
  return new Set(columns.map((c) => c.columnName));
};

const normalizeOrganizationTypes = async (): Promise<void> => {
  const columns = (await sequelize.query<{ columnName: string; columnType: string }>(
    `SELECT COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organizations' AND COLUMN_NAME = 'type'`,
    { type: QueryTypes.SELECT },
  )) as Array<{ columnName: string; columnType: string }>;

  const typeColumn = columns[0];
  if (!typeColumn) return;

  const columnType = typeColumn.columnType.toLowerCase();
  if (!columnType.startsWith("enum") && columnType !== "varchar(50)" && !columnType.startsWith("varchar")) {
    return;
  }

  // Allow new enum values before ALTER (e.g. PERSON → INDIVIDUAL)
  await sequelize.query(
    `ALTER TABLE organizations MODIFY COLUMN type VARCHAR(50) NOT NULL DEFAULT 'OTHER'`,
  );

  await sequelize.query(
    `UPDATE organizations SET type = 'INDIVIDUAL' WHERE type IN ('PERSON', 'person')`,
  );
  await sequelize.query(
    `UPDATE organizations SET type = 'OTHER' WHERE type NOT IN ('INDIVIDUAL', 'COMPANY', 'AGENCY', 'HOTEL', 'OTHER')`,
  );

  logger.info("Legacy organization types normalized for V1 schema.");
};

const normalizeUserPasswordColumn = async (): Promise<void> => {
  const columns = (await sequelize.query<{ columnName: string }>(
    `SELECT COLUMN_NAME AS columnName
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
       AND COLUMN_NAME IN ('password_hash', 'password')`,
    { type: QueryTypes.SELECT },
  )) as Array<{ columnName: string }>;

  const names = new Set(columns.map((c) => c.columnName));
  if (names.has("password_hash") && !names.has("password")) {
    await sequelize.query(
      `ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL`,
    );
    logger.info("Renamed users.password_hash to users.password.");
  }
};

const dropLegacyAssetTables = async (): Promise<void> => {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await sequelize.query("DROP TABLE IF EXISTS asset_images");
  await sequelize.query("DROP TABLE IF EXISTS assets");
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  logger.warn("Dropped legacy assets tables — V1 schema will be created on sync.");
};

const dropOrphanOrganizationOwnerIndexes = async (): Promise<void> => {
  const indexes = (await sequelize.query<{ indexName: string }>(
    `SELECT DISTINCT INDEX_NAME AS indexName
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'assets'
       AND COLUMN_NAME = 'organization_owner_id'`,
    { type: QueryTypes.SELECT },
  )) as Array<{ indexName: string }>;

  for (const { indexName } of indexes) {
    if (indexName === "PRIMARY") continue;
    await sequelize.query(`ALTER TABLE assets DROP INDEX \`${indexName}\``);
    logger.info(`Dropped orphan index assets.${indexName} (organization_owner_id).`);
  }
};

const normalizeAssetsTable = async (): Promise<void> => {
  const columns = await getTableColumns("assets");

  await dropOrphanOrganizationOwnerIndexes();

  if (columns.has("organization_owner_id") && !columns.has("organization_id")) {
    await sequelize.query(
      `ALTER TABLE assets CHANGE COLUMN organization_owner_id organization_id CHAR(36) NOT NULL`,
    );
    logger.info("Renamed assets.organization_owner_id to organization_id.");
    return;
  }

  const isV1AssetsTable =
    columns.has("asset_type") &&
    columns.has("organization_id") &&
    columns.has("parent_asset_id") &&
    !columns.has("category_id") &&
    !columns.has("organization_owner_id");

  if (!isV1AssetsTable) {
    await dropLegacyAssetTables();
    return;
  }

  await ensureAssetExtendedColumns();
};

const ensureAssetExtendedColumns = async (): Promise<void> => {
  const columns = await getTableColumns("assets");

  if (!columns.has("location")) {
    await sequelize.query(`ALTER TABLE assets ADD COLUMN location VARCHAR(255) NULL`);
    logger.info("Added assets.location column.");
  }

  if (!columns.has("attributes")) {
    await sequelize.query(`ALTER TABLE assets ADD COLUMN attributes JSON NULL`);
    logger.info("Added assets.attributes column.");
  }
};

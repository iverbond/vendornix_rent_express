import { Sequelize, Options } from "sequelize";
import { runLegacySchemaCleanup } from "../database/legacy-schema.cleanup";
import { env } from "./env";

const sequelizeOptions: Options = {
  dialect: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  logging: env.DB_LOGGING ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
  pool: {
    max: 20,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
};

export const sequelize = new Sequelize(sequelizeOptions);

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};

export const syncDatabase = async (): Promise<void> => {
  if (!env.DB_SYNC_ENABLED) return;
  if (env.DB_SYNC_ALTER) {
    await runLegacySchemaCleanup();
  }
  await sequelize.sync({ alter: env.DB_SYNC_ALTER });
};

import app from "../app";
import { connectDatabase, syncDatabase } from "../config/database";
import { env } from "../config/env";
import { initModels } from "../database";
import { runV1Seeders } from "../database/seeders/v1.seeder";
import { logger } from "../loggers/logger";

export const startServer = async (): Promise<void> => {
  try {
    initModels();
    await connectDatabase();
    await syncDatabase();
    await runV1Seeders();

    app.listen(env.PORT, () => {
      logger.info(`${env.APP_NAME} listening on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`API: http://localhost:${env.PORT}${env.API_PREFIX}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

import { logger } from "@/logger";
import { ModelCtor, Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import env from "@/utils/validateEnv";
import * as models from "@/models";
import config from "./config";

const dbConfig = config.getCurrentDB();

/**
 * @description Create a new Sequelize instance
 * */
export const sequelize = new Sequelize({
  database: dbConfig.dbName,
  dialect: dbConfig.dialect as Dialect,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  models: [],
  logging: env.isDev ? console.log : false,
  dialectOptions: {
    decimalNumbers: true,
  },
});

const loadModelsAndNestedModels = async (): Promise<void> => {
  // get all models, convert to array and add to sequelize
  const allModels: ModelCtor[] = [];

  allModels.push(...Object.values(models));

  sequelize.addModels(allModels);
};

export const connectDB = async ({
  force = false,
  alter = false,
}: {
  force?: boolean;
  alter?: boolean;
} = {}): Promise<void> => {
  try {
    await loadModelsAndNestedModels();

    /**
     * authenticate
     * @description Test connection to database
     */
    await sequelize.authenticate();
    logger.info(`Database connected successfully at ${dbConfig.host}`);

    // alter = table matrai alter garni wa model sanga sync garni
    // force = table lai forcefully drop garni ra naya table banau
    await sequelize.sync({ force, alter });
    logger.info("All models were synchronized successfully.");
  } catch (error) {
    logger.error(`Error connecting to database: ${error}`);
    process.exit(1);
  }
};

export default connectDB;

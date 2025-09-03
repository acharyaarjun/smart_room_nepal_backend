import env from "@/utils/validateEnv";

interface IDbConfig {
  host: string;
  port: number;
  dbName: string;
  dialect: string;
  user: string;
  password: string;
}

const config = {
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dbName: env.DB_NAME,
    dialect: env.DB_DIALECT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  getCurrentDB(): IDbConfig {
    return this.db;
  },
};

export default config;

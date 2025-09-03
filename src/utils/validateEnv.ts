import "dotenv/config";
import { cleanEnv, num, port, str } from "envalid";

/**
 * @description Validate environment variables
 * @returns {object} - Validated environment variables
 * @throws {Error} - Throws error if any of the environment variables are missing
 * @example
 * import validateEnv from "./utils/validateEnv";
 * const APP_PORT = validateEnv.APP_PORT;
 */
export default cleanEnv(process.env, {
  APP_NAME: str(),
  APP_PORT: port(),
  APP_URL: str(),

  CLIENT_URL: str(),
  NODE_ENV: str(),
  ALLOWED_ORIGINS: str(),

  // Database configuration
  DB_HOST: str(),
  DB_PORT: port(),
  DB_NAME: str(),
  DB_DIALECT: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),

  // JWT configuration
  JWT_PRIVATE_KEY: str(),
  JWT_PUBLIC_KEY: str(),
  JWT_EXPIRES_IN: num(),
  JWT_REFRESH_EXPIRES_IN: num(),
  JWT_ISSUER: str(),

  // Email configuration
  MAIL_DRIVER: str(),
  EMAIL_HOST: str(),
  EMAIL_PORT: port(),
  EMAIL_USERNAME: str(),
  EMAIL_PASSWORD: str(),
  EMAIL_FROM_ADDRESS: str(),
  EMAIL_FROM_NAME: str(),

  EXPRESS_SESSION_SECRET: str(),
  COOKIE_SECRET: str(),
});

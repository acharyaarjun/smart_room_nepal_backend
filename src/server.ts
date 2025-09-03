import "module-alias/register";
import env from "@/utils/validateEnv";
import app from "@/app";
import connectDB from "@/config/db.config";
import { createServer } from "http";
import { logger } from "@/logger";

import dotenv from "dotenv";
dotenv.config();

const initiateServer = async () => {
  // create http server
  const httpServer = createServer(app);

  const PORT = env.APP_PORT;
  httpServer.listen(PORT, () => {
    logger.info(`🚀🔥 Server is running on port http://localhost:${PORT} 🔥🚀`);
  });
};

(async () => {
  try {
    await connectDB();
    await initiateServer();
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
})();

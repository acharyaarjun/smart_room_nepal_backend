import "module-alias/register";
import env from "@/utils/validateEnv";
import app from "@/app";
import connectDB from "@/config/db.config";
import { createServer } from "http";
import { logger } from "@/logger";
import { createSocketServer, initializeSocketHandlers } from "@/socket";

import dotenv from "dotenv";
dotenv.config();

const initiateServer = async () => {
  // Create HTTP server for Express app (REST API)
  const httpServer = createServer(app);

  // Create separate HTTP server for Socket.IO
  const socketHttpServer = createServer();

  // Initialize Socket.IO on separate server
  const io = createSocketServer(socketHttpServer);
  initializeSocketHandlers(io);

  const APP_PORT = env.APP_PORT;
  const SOCKET_PORT = env.SOCKET_PORT;

  // Start Express HTTP server
  httpServer.listen(APP_PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`🚀 Express API Server STARTED`);
    console.log(`   URL: http://localhost:${APP_PORT}`);
    console.log(`   Status: RUNNING`);
    console.log("=".repeat(60) + "\n");
    logger.info(
      `🚀 Express API server is running on http://localhost:${APP_PORT}`
    );
  });

  // Start Socket.IO server on different port
  socketHttpServer.listen(SOCKET_PORT, () => {
    console.log("=".repeat(60));
    console.log(`🔌 Socket.IO Server STARTED`);
    console.log(`   URL: http://localhost:${SOCKET_PORT}`);
    console.log(`   Status: RUNNING`);
    console.log(`   Ready to accept connections!`);
    console.log("=".repeat(60) + "\n");
    logger.info(
      `🔌 Socket.IO server is running on http://localhost:${SOCKET_PORT}`
    );
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

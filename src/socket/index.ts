import { Server as SocketServer } from "socket.io";
import { logger } from "@/logger";
import { socketAuthMiddleware } from "@/middlewares/socket.middleware";
import { roomRequestConversationHandler } from "./handlers/roomRequestConversation.handler";

/**
 * @description Initialize all socket handlers
 */
export const initializeSocketHandlers = (io: SocketServer): void => {
  console.log("\n🔧 Initializing Socket.IO handlers...");

  // Apply authentication middleware
  io.use(socketAuthMiddleware);
  console.log("   ✅ Authentication middleware attached");

  // Handle connection errors
  io.engine.on("connection_error", (err) => {
    console.log("   ❌ Connection error:", err.message);
    console.log("   Error code:", err.code);
    console.log("   Error context:", err.context);
  });

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`\n   ✅ Socket connected successfully!`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(
      `   User: ${socket.data.user?.username} (ID: ${socket.data.user?.id})\n`
    );
    logger.info(`New socket connection: ${socket.id}`);

    // Initialize room request conversation handler
    roomRequestConversationHandler(socket);

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`   🔌 Socket disconnected: ${socket.id}`);
      console.log(`   Reason: ${reason}`);
    });
  });

  console.log("   ✅ Socket handlers initialized\n");
  logger.info("Socket handlers initialized");
};

export { createSocketServer } from "@/config/socket.config";
export * from "./types";

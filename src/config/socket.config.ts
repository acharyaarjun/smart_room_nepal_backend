import { Server as HttpServer } from "http";
import { Server as SocketServer, ServerOptions } from "socket.io";
import { logger } from "@/logger";

/**
 * @description Socket.IO server configuration
 * @note Allows connections from any origin (for development or testing)
 */
export const createSocketServer = (httpServer: HttpServer): SocketServer => {
  console.log("🔧 Creating Socket.IO server...");

  const socketOptions: Partial<ServerOptions> = {
    cors: {
      origin: "*", // ✅ Accept all origins
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  };

  const io = new SocketServer(httpServer, socketOptions);

  console.log("   ✅ Socket.IO server created successfully (CORS: *)");
  logger.info("Socket.IO server initialized with open CORS policy");

  return io;
};

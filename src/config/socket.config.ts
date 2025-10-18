import { Server as HttpServer } from "http";
import { Server as SocketServer, ServerOptions } from "socket.io";
import { corsOptions } from "@/app";
import { logger } from "@/logger";

/**
 * @description Socket.IO server configuration
 */
export const createSocketServer = (httpServer: HttpServer): SocketServer => {
  console.log("🔧 Creating Socket.IO server...");

  const socketOptions: Partial<ServerOptions> = {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or local HTML files)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // In development, allow all origins
          if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  };

  const io = new SocketServer(httpServer, socketOptions);

  console.log("   ✅ Socket.IO server created successfully");
  logger.info("Socket.IO server initialized");

  return io;
};

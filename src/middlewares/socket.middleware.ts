import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { logger } from "@/logger";
import getUserFromToken from "@/utils/getUserFromToken";
import { verifyToken } from "@/utils/jwtUtil";
import { User } from "@/models";

/**
 * @description Authentication middleware for Socket.IO
 * Verifies JWT token and attaches user to socket
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    console.log("🔐 Socket authentication attempt...");
    console.log("   Socket ID:", socket.id);
    console.log(
      "   Auth token:",
      socket.handshake.auth.token ? "Present" : "Missing"
    );
    console.log(
      "   Headers auth:",
      socket.handshake.headers.authorization ? "Present" : "Missing"
    );

    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      console.log("   ❌ No token provided");
      logger.warn("Socket connection attempted without token");
      return next(new Error("Authentication error: No token provided"));
    }

    console.log("   Token (first 50 chars):", token.substring(0, 50) + "...");

    // Remove "Bearer " prefix if present
    const cleanToken = token.replace("Bearer ", "");

    console.log("   🔍 Verifying token with database...");

    // Verify and get user
    const user = await getUserFromToken(cleanToken);

    if (!user) {
      console.log("   ❌ Invalid token - user not found");
      logger.warn("Socket connection attempted with invalid token");
      return next(new Error("Authentication error: Invalid token"));
    }

    // Attach user to socket
    socket.data.user = user;

    console.log("   ✅ Authentication successful!");
    console.log("   User ID:", user.id);
    console.log("   Username:", user.username);
    logger.info(`Socket authenticated for user: ${user.id} (${user.username})`);
    next();
  } catch (error) {
    console.log("   ❌ Authentication error:", (error as Error).message);
    logger.error("Socket authentication error:", error);
    next(new Error("Authentication error: " + (error as Error).message));
  }
};

import { logger } from "@/logger";
import getUserFromToken from "@/utils/getUserFromToken";
import { getAuthToken, getCookieToken } from "@/utils/jwtUtil";
import { NextFunction, Request, Response } from "express";

/**
 * Optional authentication middleware - doesn't throw error if no token
 * Sets req.user if valid token exists, otherwise req.user is undefined
 */
const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // get token from cookie or header
    const token = getCookieToken({ req }) || getAuthToken({ req });

    if (token) {
      try {
        const user = await getUserFromToken(token);
        req.user = user;
      } catch (error) {
        // Invalid token, but we don't throw error - just continue without user
        logger.log("info", "Optional auth: Invalid token provided");
      }
    }

    next();
  } catch (error) {
    // Even if error occurs, continue without authentication
    logger.log("error", "Optional auth middleware error:", error);
    next();
  }
};

export default optionalAuth;

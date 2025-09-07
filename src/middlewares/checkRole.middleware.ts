import { logger } from "@/logger";
import ApiError from "@/utils/apiError";
import { NextFunction, Request, Response } from "express";
import { Role } from "@/enums";

const checkRole = (allowedRoles: Role[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user exists in request (should be set by auth middleware)
      if (!req.user) {
        return next(
          new ApiError({
            status: 401,
            message: "Unauthorized - User not authenticated",
          })
        );
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.error(
          `Access denied for user ${req.user.id} with role ${
            req.user.role
          }. Required roles: ${allowedRoles.join(", ")}`
        );

        return next(
          new ApiError({
            status: 403,
            message: "Forbidden - Insufficient permissions",
            errors: [
              {
                role: `Required role(s): ${allowedRoles.join(", ")}`,
              },
            ],
          })
        );
      }

      next();
    } catch (error) {
      logger.log("error", error);
      logger.error(error);

      if (error instanceof ApiError) {
        return next(error);
      }

      next(
        new ApiError({
          status: 500,
          message: "Internal server error during role check",
        })
      );
    }
  };
};

export default checkRole;

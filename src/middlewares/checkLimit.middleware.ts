import { logger } from "@/logger";
import ApiError from "@/utils/apiError";
import { NextFunction, Request, Response } from "express";
import { PaymentStatus, Role } from "@/enums";
import { MembershipType, Payment, Room } from "@/models";

const checkLimit = () => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return next(
          new ApiError({
            status: 401,
            message: "Unauthorized - User not authenticated",
          })
        );
      }

      // Check if user has required role
      if (Role.HOST !== req.user.role) {
        logger.error(
          `Access denied for user ${req.user.id} with role ${req.user.role}. Required roles: ${Role.HOST}`
        );

        return next(
          new ApiError({
            status: 403,
            message: "Forbidden - Insufficient permissions",
            errors: [
              {
                role: `Required role(s): ${Role.HOST}`,
              },
            ],
          })
        );
      }

      const rooms = await Room.count({
        where: {
          userId: req.user.id,
        },
      });

      let totalLimit = 1; // default limit for registered users

      // get user memberships
      const userMemberships = await Payment.findAll({
        attributes: ["id", "status"],
        include: [
          {
            model: MembershipType,
            attributes: ["id", "name", "limit"],
          },
        ],
        where: {
          userId: req.user.id,
          status: PaymentStatus.COMPLETED,
        },
      });

      if (userMemberships && userMemberships.length > 0) {
        // calculate total limit from all memberships
        totalLimit = userMemberships.reduce((acc, membership) => {
          if (
            membership.membershipType &&
            typeof membership.membershipType.limit === "number"
          ) {
            return acc + membership.membershipType.limit;
          }
          return acc;
        }, 0);
      }

      if (rooms >= totalLimit) {
        return next(
          new ApiError({
            status: 403,
            message: `Room limit reached. You can add up to ${totalLimit} room(s).`,
            errors: [
              {
                room: `You have reached your room limit of ${totalLimit}. Please upgrade your membership to add more rooms.`,
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

export default checkLimit;

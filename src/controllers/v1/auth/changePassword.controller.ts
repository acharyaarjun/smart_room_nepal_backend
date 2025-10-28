import { Request, Response, NextFunction } from "express";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import {
  User,
  UserProfile,
  Media,
  Payment,
  MembershipType,
  Room,
} from "@/models";
import { PaymentStatus, Role } from "@/enums";

/**
 * Change Password
 * @route PUT /api/v1/auth/change-password
 * @access Private
 */
const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Find user with password
  const user = await User.findByPk(userId, {
    attributes: [
      "id",
      "username",
      "role",
      "email",
      "fullName",
      "isEmailVerified",
      "isEnabled",
      "password",
      "loginMethod",
    ],
  });

  if (!user) {
    return next(
      new ApiError({
        status: 404,
        message: "User not found",
      })
    );
  }

  // Verify current password
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    return next(
      new ApiError({
        status: 401,
        message: "Current password is incorrect",
        errors: [
          {
            currentPassword: "Current password is incorrect",
          },
        ],
      })
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Calculate available credits for hosts
  let totalLimit = 1;
  if (user.role === Role.HOST) {
    const rooms = await Room.count({
      where: {
        userId: user.id,
      },
    });

    // Get user memberships
    const userMemberships = await Payment.findAll({
      attributes: ["id", "status"],
      include: [
        {
          model: MembershipType,
          attributes: ["id", "name", "limit"],
        },
      ],
      where: {
        userId: user.id,
        status: PaymentStatus.COMPLETED,
      },
    });

    if (userMemberships && userMemberships.length > 0) {
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

    totalLimit = totalLimit - rooms;
  }

  // Fetch user with complete profile (same format as login, but without tokens)
  const responseData = {
    user: await User.findByPk(user.id, {
      attributes: [
        "id",
        "role",
        "username",
        "email",
        "fullName",
        "isEmailVerified",
        "isEnabled",
        "loginMethod",
      ],
      include: [
        {
          model: UserProfile,
          attributes: [
            "id",
            "phone",
            "gender",
            "dob",
            "occupationStatus",
            "maritalStatus",
          ],
          include: [
            {
              model: Media,
              as: "avatar",
              attributes: ["fileName", "path", "mimeType", "url"],
            },
            {
              model: Media,
              as: "document",
              attributes: ["fileName", "path", "mimeType", "url"],
            },
          ],
        },
      ],
    }),
    availableCredits:
      user.role === Role.HOST ? (totalLimit > 0 ? totalLimit : 0) : undefined,
  };

  new ApiResponse({
    status: 200,
    message: "Password changed successfully",
    data: responseData,
  }).send(res);
};

export default changePassword;

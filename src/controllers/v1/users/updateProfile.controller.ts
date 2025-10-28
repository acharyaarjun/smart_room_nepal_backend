import {
  Media,
  User,
  UserProfile,
  Payment,
  MembershipType,
  Room,
} from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";
import { FileStorageDirectory, Role, PaymentStatus } from "@/enums";
import { createMedia } from "@/controllers/v1/media";
import { removeLocalFileFromPath } from "@/helpers";

const updateProfile = async (req: Request, res: Response) => {
  const user = req.user;

  // Safely extract body fields with default empty object
  const body = req.body || {};
  const { fullName, phone, gender, dob, occupationStatus, maritalStatus } =
    body;

  // Handle multiple file uploads using .any()
  const files = req.files as Express.Multer.File[];
  const avatarFile = files?.find((f) => f.fieldname === "avatar");
  const documentFile = files?.find((f) => f.fieldname === "document");

  // Find user with profile
  const userRecord = await User.findByPk(user.id, {
    include: [
      {
        model: UserProfile,
        include: [
          {
            model: Media,
            as: "avatar",
          },
          {
            model: Media,
            as: "document",
          },
        ],
      },
    ],
  });

  if (!userRecord) {
    throw new ApiError({
      status: 404,
      message: "User not found",
    });
  }

  // User can update: fullName from User table
  const userUpdateData: any = {};
  if (fullName !== undefined) userUpdateData.fullName = fullName;

  // User can update UserProfile fields EXCEPT isEnabled and status
  const profileUpdateData: any = {};
  if (phone !== undefined) profileUpdateData.phone = phone;
  if (gender !== undefined) profileUpdateData.gender = gender;
  if (dob !== undefined) profileUpdateData.dob = dob;
  if (occupationStatus !== undefined)
    profileUpdateData.occupationStatus = occupationStatus;
  if (maritalStatus !== undefined)
    profileUpdateData.maritalStatus = maritalStatus;

  // Handle avatar upload - save in AVATAR directory
  if (avatarFile) {
    try {
      // Delete old avatar if exists
      if (userRecord.userProfile.avatarId) {
        const oldAvatar = await Media.findByPk(userRecord.userProfile.avatarId);
        if (oldAvatar) {
          await removeLocalFileFromPath(oldAvatar.path);
          await oldAvatar.destroy({ force: true });
        }
      }

      // Create new avatar in AVATAR directory
      const newAvatar = await createMedia({
        user: userRecord,
        file: avatarFile,
        directory: FileStorageDirectory.DOCUMENTS,
      });

      profileUpdateData.avatarId = newAvatar.id;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw new ApiError({
        status: 500,
        message: "Failed to upload avatar",
      });
    }
  }

  // Handle document upload - save in DOCUMENTS directory
  if (documentFile) {
    try {
      // Delete old document if exists
      if (userRecord.userProfile.documentId) {
        const oldDocument = await Media.findByPk(
          userRecord.userProfile.documentId
        );
        if (oldDocument) {
          await removeLocalFileFromPath(oldDocument.path);
          await oldDocument.destroy({ force: true });
        }
      }

      // Create new document in DOCUMENTS directory
      const newDocument = await createMedia({
        user: userRecord,
        file: documentFile,
        directory: FileStorageDirectory.DOCUMENTS,
      });

      profileUpdateData.documentId = newDocument.id;
    } catch (error) {
      console.error("Document upload error:", error);
      throw new ApiError({
        status: 500,
        message: "Failed to upload document",
      });
    }
  }

  // Update user
  if (Object.keys(userUpdateData).length > 0) {
    await userRecord.update(userUpdateData);
  }

  // Update user profile
  if (Object.keys(profileUpdateData).length > 0) {
    await userRecord.userProfile.update(profileUpdateData);
  }

  // Fetch updated user with profile
  const updatedUser = await User.findByPk(user.id, {
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
  });

  // Calculate available credits for hosts (same as login)
  let totalLimit = 1;
  if (updatedUser && updatedUser.role === Role.HOST) {
    const rooms = await Room.count({
      where: {
        userId: updatedUser.id,
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
        userId: updatedUser.id,
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

  const responseData = {
    user: updatedUser,
    availableCredits:
      updatedUser && updatedUser.role === Role.HOST
        ? totalLimit > 0
          ? totalLimit
          : 0
        : undefined,
  };

  new ApiResponse({
    status: 200,
    message: "Profile updated successfully",
    data: responseData,
  }).send(res);
};

export default updateProfile;

import { Media, User, UserProfile } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";
import { Role, UserStatus } from "@/enums";

const updateByAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validate that body exists and has data
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError({
      status: 400,
      message: "No data provided for update. Please send request body as JSON.",
      errors: [
        {
          body: "Request body is required",
        },
      ],
    });
  }

  const {
    username,
    fullName,
    isEnabled,
    phone,
    gender,
    dob,
    occupationStatus,
    maritalStatus,
    status,
  } = req.body;

  // Find user
  const user = await User.findByPk(userId, {
    include: [
      {
        model: UserProfile,
      },
    ],
  });

  if (!user) {
    throw new ApiError({
      status: 404,
      message: "User not found",
    });
  }

  // Admin can update: fullName, username, isEnabled from User table
  const userUpdateData: any = {};
  if (username !== undefined) userUpdateData.username = username;
  if (fullName !== undefined) userUpdateData.fullName = fullName;
  if (isEnabled !== undefined) userUpdateData.isEnabled = isEnabled;

  // Admin can update ALL UserProfile fields
  const profileUpdateData: any = {};
  if (phone !== undefined) profileUpdateData.phone = phone;
  if (gender !== undefined) profileUpdateData.gender = gender;
  if (dob !== undefined) profileUpdateData.dob = dob;
  if (occupationStatus !== undefined)
    profileUpdateData.occupationStatus = occupationStatus;
  if (maritalStatus !== undefined)
    profileUpdateData.maritalStatus = maritalStatus;
  if (status !== undefined) profileUpdateData.status = status;

  // Update user
  if (Object.keys(userUpdateData).length > 0) {
    await user.update(userUpdateData);
  }

  // Update user profile
  if (Object.keys(profileUpdateData).length > 0) {
    await user.userProfile.update(profileUpdateData);
  }

  // Fetch updated user with profile
  const updatedUser = await User.findByPk(userId, {
    attributes: [
      "id",
      "username",
      "email",
      "fullName",
      "role",
      "isEmailVerified",
      "isEnabled",
      "loginMethod",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: UserProfile,
        attributes: [
          "id",
          "phone",
          "isPhoneVerified",
          "gender",
          "dob",
          "occupationStatus",
          "maritalStatus",
          "status",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: Media,
            as: "avatar",
            attributes: ["id", "fileName", "path", "mimeType", "url"],
          },
          {
            model: Media,
            as: "document",
            attributes: ["id", "fileName", "path", "mimeType", "url"],
          },
        ],
      },
    ],
  });

  new ApiResponse({
    status: 200,
    message: "User updated successfully",
    data: updatedUser,
  }).send(res);
};

export default updateByAdmin;

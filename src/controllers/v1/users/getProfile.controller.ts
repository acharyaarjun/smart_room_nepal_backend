import { Media, User, UserProfile } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const getProfile = async (req: Request, res: Response) => {
  const user = req.user;

  const userWithProfile = await User.findByPk(user.id, {
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
    message: "Profile fetched successfully",
    data: userWithProfile,
  }).send(res);
};

export default getProfile;

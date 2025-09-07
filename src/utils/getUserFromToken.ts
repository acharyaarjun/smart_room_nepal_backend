import { Media, RefreshToken, User, UserProfile } from "@/models";
import ApiError from "@/utils/apiError";
import { verifyToken } from "@/utils/jwtUtil";

const getUserFromToken = async (token?: string | null) => {
  // check if token exists
  if (!token) {
    throw new ApiError({
      status: 401,
      message: "Unauthorized",
      errors: [
        {
          token: "Token not found",
        },
      ],
      stack: "Token not found",
    });
  }

  const decodedToken = verifyToken({ token });

  const refreshToken = await RefreshToken.findByPk(decodedToken.rfId);

  if (!refreshToken) {
    throw new ApiError({
      message: "Invalid token",
      status: 401,
      errors: [
        {
          token: "Invalid token",
        },
      ],
    });
  }

  // verify refresh token
  await verifyToken({ token: refreshToken.token });

  // check if refresh token is revoked
  if (refreshToken.revokedAt) {
    throw new ApiError({
      message: "Invalid token",
      status: 401,
      errors: [
        {
          token: "Token revoked",
        },
      ],
    });
  }

  // check if refresh token is expired
  if (refreshToken.expiresAt < new Date()) {
    throw new ApiError({
      message: "Invalid token",
      status: 401,
      errors: [
        {
          token: "Token expired",
        },
      ],
    });
  }

  // get current user
  return await getUserById(refreshToken.userId);
};

export const getUserById = async (id: string | number) => {
  const user = await User.findByPk(id, {
    attributes: [
      "id",
      "role",
      "fullName",
      "username",
      "email",
      "isEmailVerified",
      "isEnabled",
      "password",
    ],
    include: [
      {
        model: UserProfile,
        attributes: ["phone", "gender", "dob"],
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

  if (!user) {
    throw new ApiError({
      message: "Invalid token",
      status: 401,
    });
  }

  // check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError({
      message: "Email not verified",
      status: 403,
      errors: [
        {
          isEmailVerified: "Email not verified",
        },
        {
          email: "Email not verified",
        },
      ],
    });
  }

  // check if user is enabled
  if (!user.isEnabled) {
    throw new ApiError({
      message: "Account disabled",
      status: 403,
      errors: [
        {
          isEnabled: "Account disabled",
        },
      ],
    });
  }

  return user;
};

export default getUserFromToken;

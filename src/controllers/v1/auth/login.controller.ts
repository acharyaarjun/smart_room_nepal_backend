import { NextFunction, Request, Response } from "express";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import {
  LoginHistory,
  Media,
  MembershipType,
  Payment,
  User,
  UserProfile,
} from "@/models";
import { ApiErrorCode, LoginMethod, PaymentStatus, Role } from "@/enums";
import env from "@/utils/validateEnv";
import { getDateAfterMinutes } from "@/helpers/helper";

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  // check if user exists
  const user = await User.findOne({
    where: { email },
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
        status: 401,
        message: "Invalid email or password",
        code: ApiErrorCode.ACCOUNT_NOT_FOUND,
      })
    );
  }

  // check if login method is default
  if (user.loginMethod !== LoginMethod.EMAIL) {
    return next(
      new ApiError({
        status: 401,
        message: `Invalid login method. Please use ${user.loginMethod} to login`,
        errors: [
          {
            loginMethod: `Invalid login method. Please use ${user.loginMethod} to login`,
          },
        ],
      })
    );
  }

  // match password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return next(
      new ApiError({
        status: 401,
        message: "Invalid email or password",
      })
    );
  }

  // check if email is verified
  if (!user.isEmailVerified) {
    return next(
      new ApiError({
        status: 403,
        message: "Email not verified",
        errors: [
          {
            isEmailVerified: "Email not verified",
          },
          {
            email: "Email not verified",
          },
        ],
      })
    );
  }

  // check if user is enabled
  if (!user.isEnabled) {
    return next(
      new ApiError({
        status: 403,
        message: "User is disabled",
        errors: [
          {
            isEnabled: "User is disabled",
          },
        ],
      })
    );
  }

  const { accessToken, refreshToken } = await generateAuthTokens({
    user,
    req,
    res,
  });

  let totalLimit = 1;
  if (user.role === Role.HOST) {
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
  }

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
    accessToken,
    refreshToken,
    availableCredits:
      user.role === Role.HOST ? (totalLimit > 0 ? totalLimit : 0) : undefined,
  };

  new ApiResponse({
    status: 200,
    message: "Login successful",
    data: responseData,
  }).send(res);
};

export const generateAuthTokens = async ({
  user,
  req,
  res,
}: {
  user: User;
  req: Request;
  res: Response;
}): Promise<{ accessToken: string; refreshToken: string }> => {
  // save refresh token
  const savedRefreshToken = await user.generateRefreshToken();

  // generate access token
  const accessToken = await user.generateAccessToken(
    savedRefreshToken.id.toString()
  );

  // store login history - find or create new
  await LoginHistory.findOrCreate({
    where: {
      userId: user.id,
      ip: req.clientIp,
      userAgent: req.headers["user-agent"],
    },
    defaults: {
      userId: user.id,
      ip: req.clientIp,
      userAgent: req.headers["user-agent"],
    },
  });

  // set cookies - access token
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure:
      env.isProd || req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: env.isProd ? "none" : "lax",
    expires: getDateAfterMinutes(env.JWT_EXPIRES_IN),
  });

  // set cookies - refresh token
  res.cookie("refreshToken", savedRefreshToken.token, {
    httpOnly: true,
    secure:
      env.isProd || req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: env.isProd ? "none" : "lax",
    expires: getDateAfterMinutes(env.JWT_REFRESH_EXPIRES_IN),
  });

  return {
    accessToken,
    refreshToken: savedRefreshToken.token,
  };
};

export default login;

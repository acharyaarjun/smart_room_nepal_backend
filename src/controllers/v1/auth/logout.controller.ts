import { NextFunction, Request, Response } from "express";
import { logger } from "@/logger";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { RefreshToken } from "@/models";
import { getAuthToken, verifyToken } from "@/utils/jwtUtil";

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // get refresh token from   header
  const token = getAuthToken({ req });

  // check if token exists
  if (!token) {
    return next(
      new ApiError({
        status: 401,
        message: "Unauthorized",
      })
    );
  }

  try {
    // verify token
    const decoded = verifyToken({ token, ignoreExpiration: true });

    const refreshToken = await RefreshToken.findByPk(decoded.rfId);

    // delete refresh token from database
    if (refreshToken) {
      await refreshToken.destroy({
        force: true,
      });
    }

    // delete token from cookie
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // send response
    new ApiResponse({
      status: 200,
      message: "Logged out",
    }).send(res);
  } catch (error) {
    logger.error(error);
    return next(
      new ApiError({
        status: 401,
        message: "Unauthorized",
      })
    );
  }
};

export default logout;

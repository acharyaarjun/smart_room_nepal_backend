import { logger } from "@/logger";
import ApiError from "@/utils/apiError";
import getUserFromToken from "@/utils/getUserFromToken";
import { getAuthToken, getCookieToken } from "@/utils/jwtUtil";
import { NextFunction, Request, Response } from "express";

const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // get refresh token from header
    const token = getCookieToken({ req }) || getAuthToken({ req });

    const user = await getUserFromToken(token);
    req.user = user;
    next();
  } catch (error) {
    logger.log("error", error);
    logger.error(error);

    if (error instanceof ApiError) {
      return next(error);
    }

    next(
      new ApiError({
        status: 401,
        message: "Unauthorized",
      })
    );
  }
};

export default auth;

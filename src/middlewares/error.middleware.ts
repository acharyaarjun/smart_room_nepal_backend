import { NextFunction, Request, Response } from "express";
import ApiError from "@/utils/apiError";
import { logger } from "@/logger";
import { MulterError } from "multer";
import { deleteUnusedMulterFilesOnError } from "@/helpers";
import env from "@/utils/validateEnv";
import { UniqueConstraintError, ValidationError } from "sequelize";

/**
 * @function errorHandlerMiddleware
 * @description Express error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Response} - Response object
 */
const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;

  // check if error is an instance of ApiError
  if (!(err instanceof ApiError)) {
    if (err instanceof MulterError) {
      error = new ApiError({
        status: 400,
        message: err.message,
        errors: [
          {
            file: err.message,
          },
        ],
        stack: err.stack,
      });
    } else {
      if (err instanceof ValidationError) {
        // Handle Sequelize validation error
        const errors = err.errors.map((error) => ({
          [error.path ?? "field"]: error.message,
        }));

        error = new ApiError({
          status: 400,
          message: errors[0][Object.keys(errors[0])[0]],
          errors,
          stack: err.stack,
        });
      } else if (err instanceof UniqueConstraintError) {
        const errors = err.errors.map((error) => ({
          [error.path ?? "field"]: error.message,
        }));

        error = new ApiError({
          status: 400,
          message: errors[0][Object.keys(errors[0])[0]],
          errors,
          stack: err.stack,
        });
      } else {
        error = new ApiError({
          status: 500,
          message: "Something went wrong",
          errors: [
            {
              message: err.message,
            },
          ],
          stack: err.stack,
        });
      }
    }
  } else {
    error = new ApiError({
      status: err.status,
      message: err.message,
      errors: err.errors,
      stack: err.stack,
      code: err.code,
    });
  }

  const response = {
    ...error,
    message: error.message,
    errors: error.errors,
    ...(env.isDev && { stack: error.stack }),
  };

  // delete unused multer files on error
  deleteUnusedMulterFilesOnError(req);

  logger.error(err);

  res.status(error.status).json(response);
  next();
  return;
};

export default errorHandlerMiddleware;

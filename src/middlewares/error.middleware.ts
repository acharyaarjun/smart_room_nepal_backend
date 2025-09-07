import { NextFunction, Request, Response } from "express";
import ApiError from "@/utils/apiError";
import { logger } from "@/logger";
import { MulterError } from "multer";
import { deleteUnusedMulterFilesOnError } from "@/helpers";
import env from "@/utils/validateEnv";
import { UniqueConstraintError, ValidationError } from "sequelize";

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;

  if (!(err instanceof ApiError)) {
    if (err instanceof MulterError) {
      console.log("🔴 MulterError:", err.message);
      console.log("Stack:", err.stack);
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
        console.log("🔴 Sequelize ValidationError:");
        console.log("Message:", err.message);
        console.log("Errors:", err.errors);
        console.log("Stack:", err.stack);

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
        console.log("🔴 Sequelize UniqueConstraintError:");
        console.log("Message:", err.message);
        console.log("Errors:", err.errors);
        console.log("Stack:", err.stack);

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
        console.log("🔴 Generic Error:");
        console.log("Message:", err.message);
        console.log("Name:", err.name);
        console.log("Stack:", err.stack);

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
    console.log("🔴 ApiError:");
    console.log("Status:", err.status);
    console.log("Message:", err.message);
    console.log("Errors:", err.errors);
    console.log("Code:", err.code);
    console.log("Stack:", err.stack);

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

  console.log("🔴 Final Error Response:");
  console.log("Status:", error.status);
  console.log("Message:", error.message);
  console.log("Response:", response);

  logger.error(err);

  res.status(error.status).json(response);
  next();
  return;
};

export default errorHandlerMiddleware;

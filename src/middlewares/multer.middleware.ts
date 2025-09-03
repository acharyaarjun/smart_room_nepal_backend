import multer from "multer";
import { multerDiskStorage } from "@/utils/fileStorageUtil";
import { Request } from "express";
import ApiError from "@/utils/apiError";
import { FileStorageDirectory } from "@/enums";

export const uploadImageFileMiddleware = ({
  directory,
  sizeInMb = 10,
}: {
  directory: FileStorageDirectory;
  sizeInMb?: number;
}): multer.Multer => {
  return multer({
    storage: multerDiskStorage(directory),
    limits: {
      fileSize: sizeInMb * 1024 * 1024,
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (file.mimetype.startsWith("image")) {
        cb(null, true);
      } else {
        cb(
          new ApiError({
            status: 400,
            message: "Only images are allowed!",
            errors: [
              {
                [file.fieldname]: "Only images are allowed!",
              },
            ],
          })
        );
      }
    },
  });
};

export const uploadFileMiddleware = ({
  directory,
  sizeInMb = 30,
}: {
  directory: FileStorageDirectory;
  sizeInMb?: number;
}): multer.Multer => {
  return multer({
    storage: multerDiskStorage(directory),
    limits: {
      fileSize: sizeInMb * 1024 * 1024,
    },
  });
};

import path from "path";
import fs from "fs";
import appRootPath from "app-root-path";
import { FileStorageDirectory } from "@/enums";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/logger";
import { Request } from "express";
import env from "@/utils/validateEnv";

// App root directory path. for example: /home/user/my-app
export const rootDir = appRootPath.path;

//get uploads directory path
export const uploadsDir = path.join(
  rootDir,
  FileStorageDirectory.FILE_UPLOAD_PATH
);

export const createFileStream = (filePath: string): fs.ReadStream => {
  return fs.createReadStream(filePath);
};

export const getFileBuffer = (filePath: string): Promise<Buffer> => {
  return fs.promises.readFile(filePath);
};

export const multerDiskStorage = (directory: string): multer.StorageEngine => {
  return multer.diskStorage({
    destination: async function (req, file, cb) {
      try {
        const fullPath = path.join(uploadsDir, directory);

        if (!(await fs.promises.stat(fullPath).catch(() => false))) {
          await fs.promises.mkdir(fullPath, { recursive: true });
        }
        cb(null, fullPath);
      } catch (err: any) {
        cb(err.message, "");
      }
    },
    filename: function (req, file, cb) {
      try {
        const fileName = uuidv4();
        cb(null, fileName + path.extname(file.originalname));
      } catch (err: any) {
        cb(err.message, "");
      }
    },
  });
};

export const renameLocalFile = async ({
  directory,
  fileName,
  newFileName,
}: {
  directory: string;
  fileName: string;
  newFileName: string;
}): Promise<void> => {
  const filePath = path.join(uploadsDir, directory, fileName);
  const newFilePath = path.join(uploadsDir, directory, newFileName);

  try {
    const exists = await fs.promises.stat(filePath).catch(() => false);
    if (exists) {
      await fs.promises.rename(filePath, newFilePath);
    }
  } catch (err) {
    logger.error(err);
  }
};

const joinFileUrl = (paths: Array<string>) => {
  return paths.join("/").replace(/\/$/, "");
};

export const generateFileUrl = ({
  directory,
  fileName,
}: {
  directory: string;
  fileName: string;
}): string => {
  return joinFileUrl([
    env.APP_URL,
    FileStorageDirectory.FILE_UPLOAD_PATH,
    directory,
    fileName,
  ]);
};

export const deleteLocalFile = async ({
  directory,
  fileName,
}: {
  directory: string;
  fileName: string;
}): Promise<void> => {
  const filePath = path.join(uploadsDir, directory, fileName);

  try {
    const exists = await fs.promises.stat(filePath).catch(() => false);
    if (exists) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const getStaticPath = ({
  req,
  directory,
  fileName,
}: {
  req: Request;
  directory: string;
  fileName: string;
}): string => {
  return `${req.protocol}://${req.get("host")}/${
    FileStorageDirectory.FILE_UPLOAD_PATH
  }/${directory}/${fileName}`;
};

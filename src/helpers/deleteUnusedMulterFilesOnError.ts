import { Request } from "express";
import { logger } from "@/logger";
import { removeLocalFileFromPath } from "@/helpers";
import { Media } from "@/models";

/**
 * @description Delete unused multer files on error
 * @param {Request} req - The request object
 * @returns {Promise<void>} - A promise
 * @example
 * deleteUnusedMulterFilesOnError(req);
 * @throws {Error} - An error
 * @async
 */
const deleteUnusedMulterFilesOnError = async (req: Request): Promise<void> => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      // If there is file uploaded and there is validation error
      // We want to remove that file
      removeLocalFileFromPath(multerFile.path);

      await deleteFileIfExistInDb(multerFile.filename);
    }

    if (multerFiles) {
      // set of file names (string)
      const fileNames = new Set<string>();

      const filesValueArray = Object.values(multerFiles);

      // If there are multiple files uploaded for more than one fields
      // We want to remove those files as well
      async function deleteNestedFiles(fileField: any) {
        if (Array.isArray(fileField)) {
          fileField.map((file) => {
            fileNames.add(file.filename);
            deleteNestedFiles(file);
          });
        } else {
          removeLocalFileFromPath(fileField.path);

          await deleteFileIfExistInDb(fileField.filename);
        }
      }

      await deleteNestedFiles(filesValueArray);
    }
  } catch (error) {
    // fail silently
    logger.error("Error while removing image files: ", error);
  }
};

const deleteFileIfExistInDb = async (fileName: string): Promise<void> => {
  try {
    const media = await Media.findOne({
      where: { fileName },
    });

    if (media) {
      await media.destroy({
        force: true,
      });
    }
  } catch (error) {
    logger.error("Error while removing image files: ", error);
  }
};

export default deleteUnusedMulterFilesOnError;

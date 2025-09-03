import fs from "fs";
import { logger } from "@/logger";

/**
 * @description Remove local file from path
 * @param {string} localPath - The local path of the file
 * @returns {void}
 * @example
 * removeLocalFileFromPath(localPath);
 * @example
 * removeLocalFileFromPath("uploads/image.jpg");
 * @throws {Error} - An error
 */
const removeLocalFileFromPath = (localPath: string): void => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error("Error while removing local files: ", err);
  });
};

export default removeLocalFileFromPath;

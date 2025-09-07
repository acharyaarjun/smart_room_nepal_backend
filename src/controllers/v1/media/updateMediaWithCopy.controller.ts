import { v4 as uuidv4 } from "uuid";
import { renameLocalFile } from "@/utils/fileStorageUtil";
import { Media } from "@/models";

const updateMediaWithCopy = async (currentMedia: Media): Promise<void> => {
  const newFileName = `${uuidv4()}.${currentMedia.fileName.split(".").pop()}`;

  await renameLocalFile({
    directory: currentMedia.path,
    fileName: currentMedia.fileName,
    newFileName,
  });

  // update file name in database
  currentMedia.fileName = newFileName;

  await currentMedia.save();
};

export default updateMediaWithCopy;

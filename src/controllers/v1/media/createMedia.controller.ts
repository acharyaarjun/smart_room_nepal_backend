import { FileStorageDirectory } from "@/enums";
import { detectMimeType } from "@/helpers/helper";
import { Media, User } from "@/models";
import { Transaction } from "sequelize";

interface ICreateMediaParams {
  directory: FileStorageDirectory;
  file: Express.Multer.File;
  user?: User;
  transaction?: Transaction;
}

const createMedia = async ({
  directory,
  file,
  user,
  transaction,
}: ICreateMediaParams): Promise<Media> => {
  const media = await Media.create(
    {
      userId: user?.id,
      fileName: file.filename,
      path: directory,
      mimeType: detectMimeType(file.filename),
      size: file.size,
    },
    {
      transaction,
    }
  );

  return media;
};

export default createMedia;

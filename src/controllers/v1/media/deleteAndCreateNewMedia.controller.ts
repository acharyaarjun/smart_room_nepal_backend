import { FileStorageDirectory } from "@/enums";
import createMedia from "./createMedia.controller";
import { Media, User } from "@/models";
import { Transaction } from "sequelize";
import { deleteMediaById } from ".";

const deleteAndCreateNewMedia = async ({
  mediaId,
  directory,
  file,
  user,
  transaction,
}: {
  mediaId?: string;
  directory: FileStorageDirectory;
  file: Express.Multer.File;
  user?: User;
  transaction?: Transaction;
}): Promise<Media> => {
  const media = await createMedia({
    directory,
    file,
    user,
  });

  if (mediaId) {
    await deleteMediaById({
      mediaId,
      transaction,
    });
  }

  return media;
};

export default deleteAndCreateNewMedia;

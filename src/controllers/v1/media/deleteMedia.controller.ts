import { Media } from "@/models";
import { deleteLocalFile } from "@/utils/fileStorageUtil";
import { Transaction } from "sequelize";

const deleteMedia = async ({
  media,
  transaction,
}: {
  transaction?: Transaction;
  media: Media;
}): Promise<void> => {
  if (transaction) {
    transaction.afterCommit(async () => {
      await deleteLocalFile({
        directory: media.path,
        fileName: media.fileName,
      });
    });
  } else {
    await deleteLocalFile({
      directory: media.path,
      fileName: media.fileName,
    });
  }

  media.destroy({
    force: true,
    transaction,
  });
};

export default deleteMedia;

import { Media } from "@/models";
import deleteMedia from "./deleteMedia.controller";
import { Transaction } from "sequelize";

const deleteMediaById = async ({
  mediaId,
  transaction,
}: {
  mediaId: string;
  transaction?: Transaction;
}): Promise<void> => {
  const media = await Media.findByPk(mediaId);

  if (media) {
    await deleteMedia({
      media,
      transaction,
    });
  }
};

export default deleteMediaById;

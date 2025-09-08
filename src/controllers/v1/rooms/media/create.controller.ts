import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";
import { createMedia } from "@/controllers/v1/media";
import { FileStorageDirectory } from "@/enums";
import { RoomMedia } from "@/models";
import { sequelize } from "@/config/db.config";

const create = async (req: Request, res: Response): Promise<void> => {
  const room = req.room;
  const user = req.user;

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new ApiError({
      status: 400,
      message: "At least one media file is required",
      errors: [
        {
          medias: "At least one media file is required",
        },
      ],
    });
  }

  // Start transaction for data consistency
  const transaction = await sequelize.transaction();

  try {
    const roomMedias = [];

    // Process each uploaded file
    for (const file of files) {
      // Create media entry
      const media = await createMedia({
        user,
        file,
        directory: FileStorageDirectory.ROOMS,
        transaction,
      });

      // Create room-media association
      const roomMedia = await RoomMedia.create(
        {
          roomId: room.id,
          mediaId: media.id,
        },
        {
          transaction,
        }
      );

      roomMedias.push({
        id: roomMedia.id,
        roomId: roomMedia.roomId,
        mediaId: roomMedia.mediaId,
        media: {
          id: media.id,
          fileName: media.fileName,
          path: media.path,
          mimeType: media.mimeType,
          size: media.size,
          url: media.url,
        },
      });
    }

    // Commit transaction
    await transaction.commit();

    // Send response
    new ApiResponse({
      message: `Successfully uploaded ${files.length} media file(s) to room`,
      status: 201,
    }).send(res);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    throw error;
  }
};

export default create;

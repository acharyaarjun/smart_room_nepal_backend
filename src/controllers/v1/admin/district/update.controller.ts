import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";
import { deleteAndCreateNewMedia } from "@/controllers/v1/media";
import { FileStorageDirectory } from "@/enums";
import { District, Media } from "@/models";

const update = async (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  const district = req.district;
  const file = req.file || undefined;

  let imageId = district.imageId;
  if (file) {
    const media = await deleteAndCreateNewMedia({
      mediaId: imageId || undefined,
      user: req.user,
      file: file,
      directory: FileStorageDirectory.DISTRICTS,
    });
    imageId = media.id;
  }

  const uploadPayload: any = {
    name,
    description,
    imageId,
  };

  const updatedData = await district.update(uploadPayload);

  const createdDistrict = await District.findByPk(updatedData.id, {
    attributes: { exclude: ["imageId"] },
    include: [
      {
        model: Media,
        attributes: ["fileName", "path", "mimeType", "url"],
      },
    ],
  });

  new ApiResponse({
    status: 201,
    message: "District updated successfully",
    data: createdDistrict,
  }).send(res);
};

export default update;

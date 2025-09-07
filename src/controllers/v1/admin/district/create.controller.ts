import { District, Media } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";
import { createMedia } from "@/controllers/v1/media";
import { FileStorageDirectory } from "@/enums";
import ApiError from "@/utils/apiError";
import { generateUniqueSlug } from "@/utils/slugify";

const create = async (req: Request, res: Response) => {
  const { name, description } = req.body || {};

  const slug = await generateUniqueSlug({
    model: District,
    text: name,
  });

  const file = req.file;

  if (!file) {
    throw new ApiError({
      status: 400,
      message: "Image is required",
      errors: [
        {
          image: "Image is required",
        },
      ],
    });
  }

  const media = await createMedia({
    user: req.user,
    file: file,
    directory: FileStorageDirectory.DISTRICTS,
  });

  const createdData = await District.create({
    name,
    slug,
    description,
    imageId: media.id,
  });

  const createdDistrict = await District.findByPk(createdData.id, {
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
    message: "District created successfully",
    data: createdDistrict,
  }).send(res);
};

export default create;

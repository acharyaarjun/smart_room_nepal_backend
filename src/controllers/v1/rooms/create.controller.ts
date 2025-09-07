import { FileStorageDirectory, Role, RoomStatus } from "@/enums";
import { District, Media, Room, User, UserProfile } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { generateUniqueSlug } from "@/utils/slugify";
import { Request, Response } from "express";
import { createMedia } from "@/controllers/v1/media";

const create = async (req: Request, res: Response) => {
  const {
    name,
    userId,
    slug,
    shortDescription,
    description,
    price,
    offerPrice,
    districtId,
    longitude,
    latitude,
    address,
    roomType,
    maxCapacity,
    roomStatus,
    isFeatured,
    unit,
  } = req.body;
  const host = req.user;

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

  let newSlug = slug;

  if (!slug) {
    newSlug = await generateUniqueSlug({
      model: Room,
      text: name,
    });
  }

  const media = await createMedia({
    user: req.user,
    file: file,
    directory: FileStorageDirectory.ROOMS,
  });

  const room = await Room.create({
    userId: userId ? userId : host?.id,
    name,
    slug: newSlug,
    shortDescription,
    description,
    price,
    unit,
    offerPrice,
    districtId,
    longitude,
    latitude,
    address,
    roomType,
    imageId: media.id,
    maxCapacity,
    roomStatus:
      req.user.role === Role.ADMIN
        ? roomStatus
          ? roomStatus
          : RoomStatus.PENDING
        : RoomStatus.PENDING,
    isFeatured,
  });

  let createdRoom = null;
  if (req.user.role === Role.ADMIN) {
    createdRoom = await Room.findByPk(room.id, {
      attributes: [
        "id",
        "name",
        "slug",
        "shortDescription",
        "description",
        "price",
        "unit",
        "offerPrice",
        "longitude",
        "latitude",
        "address",
        "roomType",
        "maxCapacity",
        "roomStatus",
        "isFeatured",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: District,
          attributes: ["id", "name", "slug", "description"],
        },
        {
          model: User,
          attributes: ["id", "username", "email", "fullName"],

          include: [
            {
              model: UserProfile,
              attributes: ["id", "phone", "status"],
              include: [
                {
                  model: Media,
                  as: "avatar",
                  attributes: ["fileName", "path", "mimeType", "url"],
                },
              ],
            },
          ],
        },
        {
          model: Media,
          attributes: ["fileName", "path", "mimeType", "url"],
        },
      ],
    });
  } else {
    createdRoom = await Room.findByPk(room.id, {
      attributes: [
        "id",
        "name",
        "slug",
        "shortDescription",
        "description",
        "price",
        "unit",
        "offerPrice",
        "longitude",
        "latitude",
        "address",
        "roomType",
        "maxCapacity",
        "roomStatus",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: District,
          attributes: ["id", "name", "slug", "description"],
        },
        {
          model: Media,
          attributes: ["fileName", "path", "mimeType", "url"],
        },
      ],
    });
  }

  new ApiResponse({
    status: 201,
    message: "Room created successfully",
    data: createdRoom,
  }).send(res);
};
export default create;

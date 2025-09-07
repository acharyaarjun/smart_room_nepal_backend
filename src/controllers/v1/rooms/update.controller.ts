import { FileStorageDirectory, Role } from "@/enums";
import { District, Media, Room, User, UserProfile } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { generateUniqueSlug } from "@/utils/slugify";
import { Request, Response } from "express";
import { deleteAndCreateNewMedia } from "@/controllers/v1/media";

const update = async (req: Request, res: Response) => {
  const room = req.room;
  const {
    name,
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

  const file = req.file || undefined;

  let imageId = room.imageId;
  if (file) {
    const media = await deleteAndCreateNewMedia({
      mediaId: imageId || undefined,
      user: req.user,
      file: file,
      directory: FileStorageDirectory.ROOMS,
    });
    imageId = media.id;
  }

  let newSlug = slug;
  if (!slug && name && name !== room.name) {
    newSlug = await generateUniqueSlug({
      model: Room,
      text: name,
    });
  }

  await room.update({
    name,
    slug: newSlug,
    shortDescription,
    description,
    price,
    unit,
    imageId,
    offerPrice,
    districtId,
    longitude,
    latitude,
    address,
    roomType,
    maxCapacity,
    roomStatus:
      req.user.role === Role.ADMIN && roomStatus ? roomStatus : room.roomStatus,
    isFeatured:
      req.user.role === Role.ADMIN && typeof isFeatured === "boolean"
        ? isFeatured
        : room.isFeatured,
  });

  let updatedRoom = null;
  if (req.user.role === Role.ADMIN) {
    updatedRoom = await Room.findByPk(room.id, {
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
    updatedRoom = await Room.findByPk(room.id, {
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
    status: 200,
    message: "Room updated successfully",
    data: updatedRoom,
  }).send(res);
};
export default update;

import { Role } from "@/enums";
import { District, Media, Room, User, UserProfile } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const getSingle = async (req: Request, res: Response) => {
  const room = req.room;

  let fetchedRoom;
  if (req.user.role === Role.ADMIN) {
    fetchedRoom = await Room.findByPk(room.id, {
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
    fetchedRoom = await Room.findByPk(room.id, {
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
    message: "Room fetched successfully",
    data: fetchedRoom,
  }).send(res);
};
export default getSingle;

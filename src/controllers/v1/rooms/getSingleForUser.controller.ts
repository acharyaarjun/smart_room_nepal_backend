import {
  District,
  Media,
  RecentlyViewed,
  Room,
  User,
  UserProfile,
} from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const getSingleForUser = async (req: Request, res: Response) => {
  const room = req.room;
  const user = req.user;
  const fetchedRoom = await Room.findByPk(room.id, {
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
      {
        model: User,
        attributes: ["id", "username", "email", "fullName", "createdAt"],
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
    ],
  });

  // Track recently viewed - only if user is authenticated
  if (user) {
    // Remove existing entry if it exists
    await RecentlyViewed.destroy({
      where: {
        userId: user.id,
        roomId: room.id,
      },
      force: true,
    });

    // Add new entry
    await RecentlyViewed.create({
      userId: user.id,
      roomId: room.id,
    });
  }

  new ApiResponse({
    status: 200,
    message: "Fetched successfully",
    data: fetchedRoom,
  }).send(res);
};
export default getSingleForUser;

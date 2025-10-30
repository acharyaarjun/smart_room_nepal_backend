import { RoomRequestStatus } from "@/enums";
import {
  Amenity,
  District,
  Media,
  RecentlyViewed,
  Room,
  RoomAmenity,
  RoomMedia,
  RoomRequest,
  User,
  UserProfile,
  Wishlist,
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
        model: RoomMedia,
        attributes: ["id"],
        include: [
          {
            model: Media,
            attributes: ["fileName", "path", "mimeType", "url"],
          },
        ],
      },
      {
        model: RoomAmenity,
        attributes: ["id", "description"],
        include: [
          {
            model: Amenity,
            attributes: ["id", "name", "description", "icon"],
          },
        ],
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

  // check if room is available or not
  const roomRequest = await RoomRequest.findOne({
    where: {
      roomId: room.id,
      status: RoomRequestStatus.ON_GOING,
    },
  });

  // if room is not available, add a flag to the response
  if (roomRequest) {
    (fetchedRoom as any).dataValues.isAvailable = false;
  } else {
    (fetchedRoom as any).dataValues.isAvailable = true;
  }

  // Check if room is wishlisted by the user
  if (user) {
    const wishlist = await Wishlist.findOne({
      where: {
        userId: user.id,
        roomId: room.id,
      },
    });
    (fetchedRoom as any).dataValues.isWishlisted = !!wishlist;
  } else {
    (fetchedRoom as any).dataValues.isWishlisted = false;
  }

  // Track recently viewed - only if user is authenticated
  if (user) {
    // Use upsert to update existing entry or create new one
    // This updates the timestamp for recently viewed sorting
    const [recentlyViewed, created] = await RecentlyViewed.findOrCreate({
      where: {
        userId: user.id,
        roomId: room.id,
      },
      defaults: {
        userId: user.id,
        roomId: room.id,
      },
    });

    // If record already exists, update it to refresh the timestamp
    if (!created) {
      await recentlyViewed.update({
        updatedAt: new Date(),
      });
    }
  }

  new ApiResponse({
    status: 200,
    message: "Fetched successfully",
    data: fetchedRoom,
  }).send(res);
};
export default getSingleForUser;

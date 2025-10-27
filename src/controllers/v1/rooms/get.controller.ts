import { RoomStatus } from "@/enums";
import { Amenity, District, Media, Room, Wishlist } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Op, Order } from "sequelize";

const get = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { isFeatured, minPrice, maxPrice, roomType, maxCapacity } = req.query;
  const districts = req.districts;
  const amenityIds = req.amenityIds;

  const whereCondition: any = {};

  whereCondition.roomStatus = RoomStatus.APPROVED;

  // Filter by multiple districts
  if (districts && districts.length > 0) {
    whereCondition.districtId = {
      [Op.in]: districts.map((d: any) => d.id),
    };
  }

  if (isFeatured !== undefined) {
    whereCondition.isFeatured = isFeatured === "true";
  }

  if (minPrice) {
    whereCondition.price = { [Op.gte]: Number(minPrice) };
  }

  if (maxPrice) {
    whereCondition.price = {
      ...whereCondition.price,
      [Op.lte]: Number(maxPrice),
    };
  }

  if (roomType) {
    whereCondition.roomType = roomType;
  }

  if (maxCapacity) {
    whereCondition.maxCapacity = maxCapacity;
  }

  if (search) {
    whereCondition[Op.or] = [
      {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }

  const query: FindAndCountOptions = {
    attributes: [
      "id",
      "name",
      "slug",
      "shortDescription",
      "price",
      "unit",
      "offerPrice",
      "address",
      "roomType",
      "maxCapacity",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Media,
        attributes: ["fileName", "path", "mimeType", "url"],
      },
      {
        model: District,
        attributes: ["id", "name", "slug"],
      },
      {
        model: Amenity,
        attributes: ["id", "name", "icon"],
        through: { attributes: [] },
        // Filter by amenities if provided
        ...(amenityIds && amenityIds.length > 0
          ? {
              where: {
                id: {
                  [Op.in]: amenityIds,
                },
              },
              required: true, // INNER JOIN to ensure room has these amenities
            }
          : {}),
      },
    ],
    distinct: true,
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await Room.findAndCountAll(query);

  // Add wishlist flag if user is authenticated
  let roomsWithWishlistFlag: any[] = paginatedData.rows;

  if (req.user) {
    const userId = req.user.id;
    const roomIds = paginatedData.rows.map((room) => room.id);

    // Get all wishlist entries for this user and these rooms
    const wishlists = await Wishlist.findAll({
      where: {
        userId,
        roomId: {
          [Op.in]: roomIds,
        },
      },
      attributes: ["roomId"],
    });

    // Create a Set of wishlisted room IDs for quick lookup
    const wishlistedRoomIds = new Set(wishlists.map((w) => w.roomId));

    // Add isWishlisted flag to each room
    roomsWithWishlistFlag = paginatedData.rows.map((room) => {
      const roomData = room.toJSON();
      return {
        ...roomData,
        isWishlisted: wishlistedRoomIds.has(room.id),
      };
    });
  } else {
    // If no user, set isWishlisted to false for all rooms
    roomsWithWishlistFlag = paginatedData.rows.map((room) => {
      const roomData = room.toJSON();
      return {
        ...roomData,
        isWishlisted: false,
      };
    });
  }

  const response = getPagingData({
    paginatedData: {
      rows: roomsWithWishlistFlag,
      count: paginatedData.count,
    },
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Fetched successfully",
    data: response,
  }).send(res);
};
export default get;

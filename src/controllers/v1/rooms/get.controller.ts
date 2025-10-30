import { RoomStatus } from "@/enums";
import { Amenity, District, Media, Room, Wishlist } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Op, Order, literal } from "sequelize";

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const get = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const {
    isFeatured,
    minPrice,
    maxPrice,
    roomType,
    maxCapacity,
    latitude,
    longitude,
    radius,
  } = req.query;
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

  // If latitude and longitude are provided, ensure rooms have valid coordinates
  if (latitude && longitude) {
    whereCondition.latitude = { [Op.ne]: null };
    whereCondition.longitude = { [Op.ne]: null };
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
      "latitude",
      "longitude",
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

  // Calculate distance if latitude and longitude are provided
  if (latitude && longitude) {
    const userLat = Number(latitude);
    const userLon = Number(longitude);
    const radiusKm = radius ? Number(radius) : null;

    roomsWithWishlistFlag = roomsWithWishlistFlag
      .map((room) => {
        // Calculate distance if room has coordinates
        if (room.latitude && room.longitude) {
          const distance = calculateDistance(
            userLat,
            userLon,
            Number(room.latitude),
            Number(room.longitude)
          );

          return {
            ...room,
            distance: Number(distance.toFixed(2)), // Distance in km, rounded to 2 decimals
          };
        }
        return {
          ...room,
          distance: null,
        };
      })
      .filter((room) => {
        // If radius is specified, filter rooms within radius
        if (radiusKm && room.distance !== null) {
          return room.distance <= radiusKm;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by distance (nearest first)
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

    // Update count if radius filter was applied
    if (radiusKm) {
      paginatedData.count = roomsWithWishlistFlag.length;
    }
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

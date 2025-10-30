import {
  RecentlyViewed,
  Room,
  District,
  Media,
  Wishlist,
  Amenity,
} from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Order, Op } from "sequelize";

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
  const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { latitude, longitude, radius } = req.query;
  const user = req.user;

  const orderClause: Order = [];
  if (sortBy) {
    orderClause.push([sortBy, orderBy || "asc"]);
  } else {
    orderClause.push(["createdAt", "desc"]);
  }

  const query: FindAndCountOptions = {
    where: {
      userId: user.id,
    },
    limit,
    offset,
    order: orderClause,
    include: [
      {
        model: Room,
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
          },
        ],
      },
    ],
    distinct: true,
  };

  const paginatedData = await RecentlyViewed.findAndCountAll(query);

  // Transform data to match room get format
  let roomsWithWishlistFlag: any[] = paginatedData.rows.map(
    (recentlyViewed) => {
      const room = recentlyViewed.room?.toJSON();
      return {
        ...room,
        isWishlisted: false, // Will be updated below
      };
    }
  );

  // Add wishlist flag
  const userId = user.id;
  const roomIds = roomsWithWishlistFlag.map((room) => room.id);

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
  roomsWithWishlistFlag = roomsWithWishlistFlag.map((room) => ({
    ...room,
    isWishlisted: wishlistedRoomIds.has(room.id),
  }));

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
    message: "Recently viewed rooms fetched successfully",
    data: response,
  }).send(res);
};

export default get;

import { Request, Response } from "express";
import ApiResponse from "@/utils/apiResponse";
import {
  Room,
  RoomRequest,
  Wishlist,
  RecentlyViewed,
  RoomReview,
  District,
  Media,
  User,
  UserProfile,
} from "@/models";
import { RoomRequestStatus } from "@/enums";
import { Op } from "sequelize";

/**
 * Get User Dashboard Data
 * @route GET /api/v1/dashboard/user
 * @access Private (User)
 */
const getUserDashboard = async (req: Request, res: Response) => {
  const userId = req.user.id;

  // Count total room requests made by user
  const totalRequests = await RoomRequest.count({
    where: { userId },
  });

  // Count pending requests
  const pendingRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.PENDING,
    },
  });

  // Count approved requests
  const approvedRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.APPROVED,
    },
  });

  // Count rejected requests
  const rejectedRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.REJECTED,
    },
  });

  // Count canceled requests
  const canceledRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.CANCELED,
    },
  });

  // Count ongoing requests
  const ongoingRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.ON_GOING,
    },
  });

  // Count completed requests
  const completedRequests = await RoomRequest.count({
    where: {
      userId,
      status: RoomRequestStatus.COMPLETED,
    },
  });

  // Count total wishlists
  const totalWishlists = await Wishlist.count({
    where: { userId },
  });

  // Count total recently viewed
  const totalRecentlyViewed = await RecentlyViewed.count({
    where: { userId },
  });

  // Count total reviews given by user (through room requests)
  const totalReviews = await RoomReview.count({
    include: [
      {
        model: RoomRequest,
        attributes: [],
        where: {
          userId,
        },
      },
    ],
  });

  // Get recent room requests (last 5)
  const recentRequests = await RoomRequest.findAll({
    where: { userId },
    limit: 5,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Room,
        attributes: ["id", "name", "slug", "price", "unit", "roomType"],
        include: [
          {
            model: Media,
            attributes: ["fileName", "path", "mimeType", "url"],
          },
          {
            model: District,
            attributes: ["id", "name", "slug"],
          },
        ],
      },
    ],
  });

  // Get wishlist items (last 5)
  const recentWishlists = await Wishlist.findAll({
    where: { userId },
    limit: 5,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Room,
        attributes: [
          "id",
          "name",
          "slug",
          "price",
          "unit",
          "roomType",
          "roomStatus",
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
        ],
      },
    ],
  });

  new ApiResponse({
    status: 200,
    message: "User dashboard data fetched successfully",
    data: {
      stats: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        canceledRequests,
        ongoingRequests,
        completedRequests,
        totalWishlists,
        totalRecentlyViewed,
        totalReviews,
      },
      recentRequests,
      recentWishlists,
    },
  }).send(res);
};

export default getUserDashboard;

import { Request, Response } from "express";
import ApiResponse from "@/utils/apiResponse";
import {
  Room,
  RoomRequest,
  RoomReview,
  Payment,
  MembershipType,
  District,
  Media,
  User,
  UserProfile,
} from "@/models";
import { RoomRequestStatus, RoomStatus, PaymentStatus } from "@/enums";
import { Op, fn, col, literal } from "sequelize";

/**
 * Get Host Dashboard Data
 * @route GET /api/v1/dashboard/host
 * @access Private (Host)
 */
const getHostDashboard = async (req: Request, res: Response) => {
  const userId = req.user.id;

  // Count total rooms created by host
  const totalRooms = await Room.count({
    where: { userId },
  });

  // Count rooms by status
  const approvedRooms = await Room.count({
    where: {
      userId,
      roomStatus: RoomStatus.APPROVED,
    },
  });

  const pendingRooms = await Room.count({
    where: {
      userId,
      roomStatus: RoomStatus.PENDING,
    },
  });

  const maintenanceRooms = await Room.count({
    where: {
      userId,
      roomStatus: RoomStatus.MAINTENANCE,
    },
  });

  const disabledByAdminRooms = await Room.count({
    where: {
      userId,
      roomStatus: RoomStatus.DISABLED_BY_ADMIN,
    },
  });

  const disabledByOwnerRooms = await Room.count({
    where: {
      userId,
      roomStatus: RoomStatus.DISABLED_BY_OWNER,
    },
  });

  const featuredRooms = await Room.count({
    where: {
      userId,
      isFeatured: true,
    },
  });

  // Get all rooms for the host to fetch requests
  const hostRoomIds = await Room.findAll({
    where: { userId },
    attributes: ["id"],
  }).then((rooms) => rooms.map((room) => room.id));

  // Count room requests for host's rooms
  const totalRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
    },
  });

  const pendingRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
      status: RoomRequestStatus.PENDING,
    },
  });

  const approvedRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
      status: RoomRequestStatus.APPROVED,
    },
  });

  const rejectedRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
      status: RoomRequestStatus.REJECTED,
    },
  });

  const ongoingRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
      status: RoomRequestStatus.ON_GOING,
    },
  });

  const completedRequests = await RoomRequest.count({
    where: {
      roomId: { [Op.in]: hostRoomIds },
      status: RoomRequestStatus.COMPLETED,
    },
  });

  // Calculate average rating for host's rooms
  const avgRatingResult = await RoomReview.findOne({
    attributes: [[fn("AVG", col("rating")), "avgRating"]],
    include: [
      {
        model: RoomRequest,
        attributes: [],
        where: {
          roomId: { [Op.in]: hostRoomIds },
        },
      },
    ],
    raw: true,
  });

  const averageRating = avgRatingResult
    ? parseFloat((avgRatingResult as any).avgRating || "0")
    : 0;

  // Count total reviews for host's rooms
  const totalReviews = await RoomReview.count({
    include: [
      {
        model: RoomRequest,
        attributes: [],
        where: {
          roomId: { [Op.in]: hostRoomIds },
        },
      },
    ],
  });

  // Get user memberships and calculate available credits
  const userMemberships = await Payment.findAll({
    attributes: ["id", "status"],
    include: [
      {
        model: MembershipType,
        attributes: ["id", "name", "limit"],
      },
    ],
    where: {
      userId,
      status: PaymentStatus.COMPLETED,
    },
  });

  let totalLimit = 1; // Default free limit
  if (userMemberships && userMemberships.length > 0) {
    totalLimit = userMemberships.reduce((acc, membership) => {
      if (
        membership.membershipType &&
        typeof membership.membershipType.limit === "number"
      ) {
        return acc + membership.membershipType.limit;
      }
      return acc;
    }, 0);
  }

  const availableCredits = totalLimit - totalRooms;

  // Get recent room requests (last 5)
  const recentRequests = await RoomRequest.findAll({
    where: {
      roomId: { [Op.in]: hostRoomIds },
    },
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
        ],
      },
      {
        model: User,
        attributes: ["id", "username", "email", "fullName"],
        include: [
          {
            model: UserProfile,
            attributes: ["phone"],
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

  // Get top rated rooms (last 5)
  const topRatedRooms = await Room.findAll({
    where: { userId },
    limit: 5,
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "unit",
      "roomType",
      "roomStatus",
      "isFeatured",
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
  });

  new ApiResponse({
    status: 200,
    message: "Host dashboard data fetched successfully",
    data: {
      stats: {
        totalRooms,
        approvedRooms,
        pendingRooms,
        maintenanceRooms,
        disabledByAdminRooms,
        disabledByOwnerRooms,
        featuredRooms,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        ongoingRequests,
        completedRequests,
        totalReviews,
        averageRating: Number(averageRating.toFixed(2)),
        availableCredits: availableCredits > 0 ? availableCredits : 0,
      },
      recentRequests,
      topRatedRooms,
    },
  }).send(res);
};

export default getHostDashboard;

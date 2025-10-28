import { Request, Response } from "express";
import ApiResponse from "@/utils/apiResponse";
import {
  User,
  Room,
  RoomRequest,
  RoomReview,
  Payment,
  District,
  Media,
  UserProfile,
} from "@/models";
import {
  Role,
  RoomStatus,
  RoomRequestStatus,
  PaymentStatus,
  UserStatus,
} from "@/enums";
import { Op, fn, col } from "sequelize";

/**
 * Get Admin Dashboard Data
 * @route GET /api/v1/dashboard/admin
 * @access Private (Admin)
 */
const getAdminDashboard = async (req: Request, res: Response) => {
  // User Statistics
  const totalUsers = await User.count();

  const totalAdmins = await User.count({
    where: { role: Role.ADMIN },
  });

  const totalHosts = await User.count({
    where: { role: Role.HOST },
  });

  const totalNormalUsers = await User.count({
    where: { role: Role.USER },
  });

  const activeUsers = await User.count({
    include: [
      {
        model: UserProfile,
        attributes: [],
        where: {
          status: UserStatus.ACTIVE,
        },
      },
    ],
  });

  const inactiveUsers = await User.count({
    include: [
      {
        model: UserProfile,
        attributes: [],
        where: {
          status: UserStatus.SUSPENDED,
        },
      },
    ],
  });

  // Room Statistics
  const totalRooms = await Room.count();

  const approvedRooms = await Room.count({
    where: { roomStatus: RoomStatus.APPROVED },
  });

  const pendingRooms = await Room.count({
    where: { roomStatus: RoomStatus.PENDING },
  });

  const maintenanceRooms = await Room.count({
    where: { roomStatus: RoomStatus.MAINTENANCE },
  });

  const disabledByAdminRooms = await Room.count({
    where: { roomStatus: RoomStatus.DISABLED_BY_ADMIN },
  });

  const disabledByOwnerRooms = await Room.count({
    where: { roomStatus: RoomStatus.DISABLED_BY_OWNER },
  });

  const featuredRooms = await Room.count({
    where: { isFeatured: true },
  });

  // Request Statistics
  const totalRequests = await RoomRequest.count();

  const pendingRequests = await RoomRequest.count({
    where: { status: RoomRequestStatus.PENDING },
  });

  const approvedRequests = await RoomRequest.count({
    where: { status: RoomRequestStatus.APPROVED },
  });

  const rejectedRequests = await RoomRequest.count({
    where: { status: RoomRequestStatus.REJECTED },
  });

  const ongoingRequests = await RoomRequest.count({
    where: { status: RoomRequestStatus.ON_GOING },
  });

  const completedRequests = await RoomRequest.count({
    where: { status: RoomRequestStatus.COMPLETED },
  });

  // Review Statistics
  const totalReviews = await RoomReview.count();

  const avgRatingResult = await RoomReview.findOne({
    attributes: [[fn("AVG", col("rating")), "avgRating"]],
    raw: true,
  });

  const averageRating = avgRatingResult
    ? parseFloat((avgRatingResult as any).avgRating || "0")
    : 0;

  // Payment Statistics
  const totalPayments = await Payment.count();

  const completedPayments = await Payment.count({
    where: { status: PaymentStatus.COMPLETED },
  });

  const pendingPayments = await Payment.count({
    where: { status: PaymentStatus.PENDING },
  });

  const failedPayments = await Payment.count({
    where: { status: PaymentStatus.FAILED },
  });

  // Total revenue from completed payments
  const revenueResult = await Payment.findOne({
    attributes: [[fn("SUM", col("amount")), "totalRevenue"]],
    where: { status: PaymentStatus.COMPLETED },
    raw: true,
  });

  const totalRevenue = revenueResult
    ? parseFloat((revenueResult as any).totalRevenue || "0")
    : 0;

  // District Statistics
  const totalDistricts = await District.count();

  // Recent Users (last 5)
  const recentUsers = await User.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
    attributes: ["id", "username", "email", "fullName", "role", "createdAt"],
    include: [
      {
        model: UserProfile,
        attributes: ["phone", "status"],
        include: [
          {
            model: Media,
            as: "avatar",
            attributes: ["fileName", "path", "mimeType", "url"],
          },
        ],
      },
    ],
  });

  // Recent Rooms (last 5)
  const recentRooms = await Room.findAll({
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
      "createdAt",
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
        model: User,
        attributes: ["id", "username", "email", "fullName"],
      },
    ],
  });

  // Recent Requests (last 5)
  const recentRequests = await RoomRequest.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Room,
        attributes: ["id", "name", "slug", "price", "unit"],
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
          },
        ],
      },
    ],
  });

  new ApiResponse({
    status: 200,
    message: "Admin dashboard data fetched successfully",
    data: {
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          hosts: totalHosts,
          normalUsers: totalNormalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        rooms: {
          total: totalRooms,
          approved: approvedRooms,
          pending: pendingRooms,
          maintenance: maintenanceRooms,
          disabledByAdmin: disabledByAdminRooms,
          disabledByOwner: disabledByOwnerRooms,
          featured: featuredRooms,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          ongoing: ongoingRequests,
          completed: completedRequests,
        },
        reviews: {
          total: totalReviews,
          averageRating: Number(averageRating.toFixed(2)),
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          failed: failedPayments,
          totalRevenue: Number(totalRevenue.toFixed(2)),
        },
        districts: {
          total: totalDistricts,
        },
      },
      recentUsers,
      recentRooms,
      recentRequests,
    },
  }).send(res);
};

export default getAdminDashboard;

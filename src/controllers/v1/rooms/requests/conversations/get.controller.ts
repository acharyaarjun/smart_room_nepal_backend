import { Request, Response, NextFunction } from "express";
import { RoomRequest, RoomRequestConversation, Room } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import ApiError from "@/utils/apiError";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { MessageSender } from "@/enums";
import { FindAndCountOptions, Order } from "sequelize";

/**
 * @description Get conversation messages for a room request
 * @route GET /api/v1/room-requests/:roomRequestId/conversations
 * @access Private (User and Room Owner only)
 */
const get = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomRequestId } = req.params;
    const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
    const { limit, offset } = getPagination({ page, size });
    const user = req.user;

    // Verify room request exists
    const roomRequest = await RoomRequest.findByPk(roomRequestId, {
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "userId", "name"],
        },
      ],
    });

    if (!roomRequest) {
      throw new ApiError({
        status: 404,
        message: "Room request not found",
      });
    }

    // Verify access (must be requester or room owner)
    const isRequester = roomRequest.userId === user.id;
    const isRoomOwner = roomRequest.room?.userId === user.id;

    if (!isRequester && !isRoomOwner) {
      throw new ApiError({
        status: 403,
        message: "You don't have access to this conversation",
      });
    }

    // Build query with pagination and sorting
    const query: FindAndCountOptions = {
      where: {
        roomRequestId: roomRequest.id,
      },
      order: [[sortBy, orderBy]] as Order,
      limit,
      offset,
    };

    // Get conversations with pagination
    const paginatedData = await RoomRequestConversation.findAndCountAll(query);

    // Get unread count for current user
    const sender = isRoomOwner ? MessageSender.HOST : MessageSender.USER;
    const oppositeSender =
      sender === MessageSender.USER ? MessageSender.HOST : MessageSender.USER;

    const unreadCount = await RoomRequestConversation.count({
      where: {
        roomRequestId: roomRequest.id,
        sender: oppositeSender,
        isRead: false,
      },
    });

    // Format response using getPagingData
    const response = getPagingData({
      paginatedData,
      page,
      limit,
    });

    // Add additional metadata
    const responseData = {
      ...response,
      unreadCount,
      roomRequest: {
        id: roomRequest.id,
        token: roomRequest.token,
        status: roomRequest.status,
        isFixedDate: roomRequest.isFixedDate,
        startDate: roomRequest.startDate,
        endDate: roomRequest.endDate,
        price: roomRequest.price,
        acceptedPrice: roomRequest.acceptedPrice,
      },
    };

    new ApiResponse({
      status: 200,
      message: "Conversations retrieved successfully",
      data: responseData,
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export default get;

import { Request, Response, NextFunction } from "express";
import { RoomRequest, RoomRequestConversation, User, Room } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import ApiError from "@/utils/apiError";
import { decodeGetQuery, getPagination } from "@/utils/paginationUtil";
import { MessageSender, Role } from "@/enums";

/**
 * @description Get conversation messages for a room request
 * @route GET /api/v1/room-requests/:roomRequestId/conversations
 * @access Private (User and Room Owner only)
 */
export const getRoomRequestConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomRequestId } = req.params;
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

    // Get pagination params
    const { page, size } = decodeGetQuery(req.query);
    const { limit, offset } = getPagination({ page, size });

    // Get conversations with pagination
    const { rows: conversations, count: totalConversations } =
      await RoomRequestConversation.findAndCountAll({
        where: {
          roomRequestId: roomRequest.id,
        },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

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

    // Format response
    const response = new ApiResponse({
      status: 200,
      message: "Conversations retrieved successfully",
      data: {
        conversations: conversations.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalConversations / limit),
          totalItems: totalConversations,
          itemsPerPage: limit,
        },
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
      },
    });

    res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Get unread messages count for a room request
 * @route GET /api/v1/room-requests/:roomRequestId/conversations/unread-count
 * @access Private (User and Room Owner only)
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomRequestId } = req.params;
    const user = req.user;

    // Verify room request exists and user has access
    const roomRequest = await RoomRequest.findByPk(roomRequestId, {
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "userId"],
        },
      ],
    });

    if (!roomRequest) {
      throw new ApiError({
        status: 404,
        message: "Room request not found",
      });
    }

    const isRequester = roomRequest.userId === user.id;
    const isRoomOwner = roomRequest.room?.userId === user.id;

    if (!isRequester && !isRoomOwner) {
      throw new ApiError({
        status: 403,
        message: "You don't have access to this conversation",
      });
    }

    // Determine opposite sender
    const sender = isRoomOwner ? MessageSender.HOST : MessageSender.USER;
    const oppositeSender =
      sender === MessageSender.USER ? MessageSender.HOST : MessageSender.USER;

    // Count unread messages
    const unreadCount = await RoomRequestConversation.count({
      where: {
        roomRequestId: roomRequest.id,
        sender: oppositeSender,
        isRead: false,
      },
    });

    const response = new ApiResponse({
      status: 200,
      message: "Unread count retrieved successfully",
      data: {
        roomRequestId: roomRequest.id,
        unreadCount,
      },
    });

    res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Get all room requests with unread message counts for a user
 * @route GET /api/v1/room-requests/conversations/unread-summary
 * @access Private
 */
export const getUnreadSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    // Get all room requests for user (as requester)
    const userRoomRequests = await RoomRequest.findAll({
      where: {
        userId: user.id,
      },
      attributes: ["id", "token", "status"],
    });

    // Get all room requests where user is the room owner
    const ownerRoomRequests = await RoomRequest.findAll({
      include: [
        {
          model: Room,
          as: "room",
          where: {
            userId: user.id,
          },
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "token", "status"],
    });

    // Calculate unread counts
    const userUnreadCounts = await Promise.all(
      userRoomRequests.map(async (rr) => {
        const count = await RoomRequestConversation.count({
          where: {
            roomRequestId: rr.id,
            sender: MessageSender.HOST,
            isRead: false,
          },
        });
        return {
          roomRequestId: rr.id,
          token: rr.token,
          status: rr.status,
          unreadCount: count,
          role: "requester" as const,
        };
      })
    );

    const ownerUnreadCounts = await Promise.all(
      ownerRoomRequests.map(async (rr) => {
        const count = await RoomRequestConversation.count({
          where: {
            roomRequestId: rr.id,
            sender: MessageSender.USER,
            isRead: false,
          },
        });
        return {
          roomRequestId: rr.id,
          token: rr.token,
          status: rr.status,
          unreadCount: count,
          role: "owner" as const,
          roomName: rr.room?.name,
        };
      })
    );

    const allUnreadCounts = [...userUnreadCounts, ...ownerUnreadCounts];
    const totalUnread = allUnreadCounts.reduce(
      (sum, item) => sum + item.unreadCount,
      0
    );

    const response = new ApiResponse({
      status: 200,
      message: "Unread summary retrieved successfully",
      data: {
        totalUnread,
        roomRequests: allUnreadCounts.filter((item) => item.unreadCount > 0),
        allRoomRequests: allUnreadCounts,
      },
    });

    res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

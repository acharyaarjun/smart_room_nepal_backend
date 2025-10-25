import { Request, Response, NextFunction } from "express";
import { RoomRequest, RoomRequestConversation, Room } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import ApiError from "@/utils/apiError";
import { MessageSender } from "@/enums";

/**
 * @description Get unread messages count for a room request
 * @route GET /api/v1/room-requests/:roomRequestId/conversations/unread-count
 * @access Private (User and Room Owner only)
 */
const getUnreadCount = async (
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

    new ApiResponse({
      status: 200,
      message: "Unread count retrieved successfully",
      data: {
        roomRequestId: roomRequest.id,
        unreadCount,
      },
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export default getUnreadCount;

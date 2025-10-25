import { Request, Response, NextFunction } from "express";
import { RoomRequest, RoomRequestConversation, Room } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { MessageSender } from "@/enums";

/**
 * @description Get all room requests with unread message counts for a user
 * @route GET /api/v1/room-requests/conversations/unread-summary
 * @access Private
 */
const getUnreadSummary = async (
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

    new ApiResponse({
      status: 200,
      message: "Unread summary retrieved successfully",
      data: {
        totalUnread,
        roomRequests: allUnreadCounts.filter((item) => item.unreadCount > 0),
        allRoomRequests: allUnreadCounts,
      },
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export default getUnreadSummary;

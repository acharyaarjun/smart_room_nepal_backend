import { Socket } from "socket.io";
import { logger } from "@/logger";
import { RoomRequest, RoomRequestConversation, Room, User } from "@/models";
import { MessageSender, Role } from "@/enums";
import {
  SocketEvents,
  IJoinRoomRequestData,
  ILeaveRoomRequestData,
  ISendMessageData,
  IMarkAsReadData,
  ITypingData,
  IRoomRequestErrorData,
  IMessageReceivedData,
} from "../types";
import { Op } from "sequelize";

/**
 * @description Get room name for socket rooms
 */
const getRoomName = (roomRequestId: number): string => {
  return `room_request_${roomRequestId}`;
};

/**
 * @description Verify user has access to room request
 */
const verifyRoomRequestAccess = async (
  roomRequestId: number,
  userId: number,
  userRole: Role
): Promise<{
  hasAccess: boolean;
  roomRequest?: RoomRequest;
  error?: string;
}> => {
  try {
    const roomRequest = await RoomRequest.findByPk(roomRequestId, {
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "userId", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "fullName"],
        },
      ],
    });

    if (!roomRequest) {
      return { hasAccess: false, error: "Room request not found" };
    }

    // Check if user is the requester or the room owner
    const isRequester = roomRequest.userId === userId;
    const isRoomOwner = roomRequest.room?.userId === userId;

    if (!isRequester && !isRoomOwner) {
      return {
        hasAccess: false,
        error: "You don't have access to this room request",
      };
    }

    return { hasAccess: true, roomRequest };
  } catch (error) {
    logger.error("Error verifying room request access:", error);
    return { hasAccess: false, error: "Failed to verify access" };
  }
};

/**
 * @description Determine message sender type based on user role and room ownership
 */
const determineSender = (
  userId: number,
  roomRequest: RoomRequest
): MessageSender => {
  // If user is the room owner, they are HOST
  if (roomRequest.room?.userId === userId) {
    return MessageSender.HOST;
  }
  // If user is the requester, they are USER
  return MessageSender.USER;
};

/**
 * @description Handle room request conversation socket events
 */
export const roomRequestConversationHandler = (socket: Socket) => {
  const user = socket.data.user;

  logger.info(`User ${user.username} (ID: ${user.id}) connected to socket`);

  /**
   * Join a room request conversation
   */
  socket.on(
    SocketEvents.JOIN_ROOM_REQUEST,
    async (data: IJoinRoomRequestData) => {
      try {
        const { roomRequestId } = data;

        logger.info(
          `User ${user.username} attempting to join room request ${roomRequestId}`
        );

        // Verify access
        const { hasAccess, roomRequest, error } = await verifyRoomRequestAccess(
          roomRequestId,
          user.id,
          user.role
        );

        if (!hasAccess || !roomRequest) {
          const errorData: IRoomRequestErrorData = {
            message: error || "Access denied",
            code: "ACCESS_DENIED",
          };
          socket.emit(SocketEvents.ROOM_REQUEST_ERROR, errorData);
          return;
        }

        // Join the socket room
        const roomName = getRoomName(roomRequestId);
        await socket.join(roomName);

        logger.info(
          `User ${user.username} joined room request ${roomRequestId}`
        );

        // Mark unread messages as read for this user
        const sender = determineSender(user.id, roomRequest);
        const oppositeSender =
          sender === MessageSender.USER
            ? MessageSender.HOST
            : MessageSender.USER;

        await RoomRequestConversation.update(
          { isRead: true },
          {
            where: {
              roomRequestId,
              sender: oppositeSender,
              isRead: false,
            },
          }
        );
      } catch (error) {
        logger.error("Error joining room request:", error);
        const errorData: IRoomRequestErrorData = {
          message: "Failed to join room request",
          code: "JOIN_ERROR",
        };
        socket.emit(SocketEvents.ROOM_REQUEST_ERROR, errorData);
      }
    }
  );

  /**
   * Leave a room request conversation
   */
  socket.on(
    SocketEvents.LEAVE_ROOM_REQUEST,
    async (data: ILeaveRoomRequestData) => {
      try {
        const { roomRequestId } = data;
        const roomName = getRoomName(roomRequestId);

        await socket.leave(roomName);

        logger.info(`User ${user.username} left room request ${roomRequestId}`);
      } catch (error) {
        logger.error("Error leaving room request:", error);
      }
    }
  );

  /**
   * Send a message in room request conversation
   */
  socket.on(SocketEvents.SEND_MESSAGE, async (data: ISendMessageData) => {
    try {
      const { roomRequestId, message } = data;

      if (!message || message.trim().length === 0) {
        const errorData: IRoomRequestErrorData = {
          message: "Message cannot be empty",
          code: "INVALID_MESSAGE",
        };
        socket.emit(SocketEvents.ROOM_REQUEST_ERROR, errorData);
        return;
      }

      // Verify access
      const { hasAccess, roomRequest, error } = await verifyRoomRequestAccess(
        roomRequestId,
        user.id,
        user.role
      );

      if (!hasAccess || !roomRequest) {
        const errorData: IRoomRequestErrorData = {
          message: error || "Access denied",
          code: "ACCESS_DENIED",
        };
        socket.emit(SocketEvents.ROOM_REQUEST_ERROR, errorData);
        return;
      }

      // Determine sender type
      const sender = determineSender(user.id, roomRequest);

      // Create conversation message
      const conversation = await RoomRequestConversation.create({
        roomRequestId,
        sender,
        message: message.trim(),
        isRead: false,
      });

      logger.info(
        `User ${user.username} sent message in room request ${roomRequestId}`
      );

      // Prepare message data to emit
      const messageData: IMessageReceivedData = {
        id: conversation.id,
        roomRequestId: conversation.roomRequestId,
        sender: conversation.sender,
        message: conversation.message,
        isRead: conversation.isRead,
        createdAt: conversation.createdAt,
        senderDetails: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
        },
      };

      // Emit to all users in the room (including sender)
      const roomName = getRoomName(roomRequestId);
      socket.to(roomName).emit(SocketEvents.MESSAGE_RECEIVED, messageData);
      socket.emit(SocketEvents.MESSAGE_RECEIVED, messageData);
    } catch (error) {
      logger.error("Error sending message:", error);
      const errorData: IRoomRequestErrorData = {
        message: "Failed to send message",
        code: "SEND_ERROR",
      };
      socket.emit(SocketEvents.ROOM_REQUEST_ERROR, errorData);
    }
  });

  /**
   * Mark messages as read
   */
  socket.on(SocketEvents.MARK_AS_READ, async (data: IMarkAsReadData) => {
    try {
      const { roomRequestId } = data;

      // Verify access
      const { hasAccess, roomRequest, error } = await verifyRoomRequestAccess(
        roomRequestId,
        user.id,
        user.role
      );

      if (!hasAccess || !roomRequest) {
        return;
      }

      // Determine sender type and mark opposite sender's messages as read
      const sender = determineSender(user.id, roomRequest);
      const oppositeSender =
        sender === MessageSender.USER ? MessageSender.HOST : MessageSender.USER;

      // Get unread message IDs
      const unreadMessages = await RoomRequestConversation.findAll({
        where: {
          roomRequestId,
          sender: oppositeSender,
          isRead: false,
        },
        attributes: ["id"],
      });

      const messageIds = unreadMessages.map((msg) => msg.id);

      if (messageIds.length > 0) {
        // Mark as read
        await RoomRequestConversation.update(
          { isRead: true },
          {
            where: {
              id: {
                [Op.in]: messageIds,
              },
            },
          }
        );

        logger.info(
          `User ${user.username} marked ${messageIds.length} messages as read in room request ${roomRequestId}`
        );

        // Notify other users in the room
        const roomName = getRoomName(roomRequestId);
        socket.to(roomName).emit(SocketEvents.MESSAGES_MARKED_READ, {
          roomRequestId,
          messageIds,
        });
      }
    } catch (error) {
      logger.error("Error marking messages as read:", error);
    }
  });

  /**
   * User is typing
   */
  socket.on(SocketEvents.TYPING, async (data: ITypingData) => {
    try {
      const { roomRequestId } = data;

      // Verify access
      const { hasAccess } = await verifyRoomRequestAccess(
        roomRequestId,
        user.id,
        user.role
      );

      if (!hasAccess) {
        return;
      }

      // Notify other users in the room
      const roomName = getRoomName(roomRequestId);
      socket.to(roomName).emit(SocketEvents.USER_TYPING, {
        roomRequestId,
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      logger.error("Error handling typing event:", error);
    }
  });

  /**
   * User stopped typing
   */
  socket.on(SocketEvents.STOP_TYPING, async (data: ITypingData) => {
    try {
      const { roomRequestId } = data;

      // Verify access
      const { hasAccess } = await verifyRoomRequestAccess(
        roomRequestId,
        user.id,
        user.role
      );

      if (!hasAccess) {
        return;
      }

      // Notify other users in the room
      const roomName = getRoomName(roomRequestId);
      socket.to(roomName).emit(SocketEvents.USER_STOP_TYPING, {
        roomRequestId,
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      logger.error("Error handling stop typing event:", error);
    }
  });

  /**
   * Handle disconnection
   */
  socket.on(SocketEvents.DISCONNECT, () => {
    logger.info(`User ${user.username} (ID: ${user.id}) disconnected`);
  });
};

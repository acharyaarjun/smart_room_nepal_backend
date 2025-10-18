import { User } from "@/models";
import { MessageSender } from "@/enums";

/**
 * Socket Event Types
 */
export enum SocketEvents {
  // Connection events
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  ERROR = "error",

  // Room request conversation events
  JOIN_ROOM_REQUEST = "join_room_request",
  LEAVE_ROOM_REQUEST = "leave_room_request",
  SEND_MESSAGE = "send_message",
  MESSAGE_RECEIVED = "message_received",
  MARK_AS_READ = "mark_as_read",
  MESSAGES_MARKED_READ = "messages_marked_read",
  TYPING = "typing",
  STOP_TYPING = "stop_typing",
  USER_TYPING = "user_typing",
  USER_STOP_TYPING = "user_stop_typing",

  // Error events
  ROOM_REQUEST_ERROR = "room_request_error",
}

/**
 * Socket Data Interfaces
 */
export interface IJoinRoomRequestData {
  roomRequestId: number;
}

export interface ILeaveRoomRequestData {
  roomRequestId: number;
}

export interface ISendMessageData {
  roomRequestId: number;
  message: string;
}

export interface IMessageReceivedData {
  id: number;
  roomRequestId: number;
  sender: MessageSender;
  message: string;
  isRead: boolean;
  createdAt: Date;
  senderDetails: {
    id: number;
    username: string;
    fullName: string;
  };
}

export interface IMarkAsReadData {
  roomRequestId: number;
}

export interface IMessagesMarkedReadData {
  roomRequestId: number;
  messageIds: number[];
}

export interface ITypingData {
  roomRequestId: number;
}

export interface IUserTypingData {
  roomRequestId: number;
  userId: number;
  username: string;
}

export interface IRoomRequestErrorData {
  message: string;
  code?: string;
}

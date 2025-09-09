import { MessageSender, RoomRequestStatus } from "@/enums";
import { RoomRequest, RoomRequestConversation } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const room = req.room;
  const { isFixedDate, startDate, endDate, message } = req.body || {};
  const user = req.user;

  const latestRoomRequest = await RoomRequest.findOne({
    attributes: ["id", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  let latestRequestId = 1;
  if (latestRoomRequest) {
    latestRequestId = latestRoomRequest.id + 1;
  }
  const token = `R${room.id}U${user.id}RR${latestRequestId}`;
  let roomPrice = room.offerPrice ? room.price - room.offerPrice : room.price;

  if (isFixedDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    roomPrice = roomPrice * diffDays;
  }

  const roomRequest = await RoomRequest.create({
    roomId: room.id,
    userId: user.id,
    isFixedDate,
    startDate,
    endDate,
    token,
    status: RoomRequestStatus.PENDING,
    price: roomPrice,
    acceptedPrice: roomPrice,
  });

  await RoomRequestConversation.create({
    roomRequestId: roomRequest.id,
    sender: MessageSender.USER,
    message: message || "Hi, I am interested in this room.",
    isRead: false,
  });

  new ApiResponse({
    status: 201,
    message: "Room request created successfully",
  }).send(res);
};
export default create;

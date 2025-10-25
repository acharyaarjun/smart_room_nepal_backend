import { RoomReview } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const { rating, message, mediaId } = req.body;
  const roomRequest = req.roomRequest;

  const review = await RoomReview.create({
    roomRequestId: roomRequest.id,
    rating,
    message,
    mediaId: mediaId || null,
  });

  new ApiResponse({
    status: 201,
    message: "Review created successfully",
    data: review,
  }).send(res);
};

export default create;

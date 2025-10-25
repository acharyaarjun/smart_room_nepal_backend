import {
  Media,
  Room,
  RoomRequest,
  RoomReview,
  User,
  UserProfile,
} from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const getByRoomRequest = async (req: Request, res: Response) => {
  const roomRequest = req.roomRequest;

  const review = await RoomReview.findOne({
    where: { roomRequestId: roomRequest.id },
    attributes: ["id", "rating", "message", "createdAt", "updatedAt"],
    include: [
      {
        model: Media,
        attributes: ["id", "fileName", "path", "mimeType", "url"],
      },
      {
        model: RoomRequest,
        attributes: ["id", "token", "status"],
        include: [
          {
            model: User,
            attributes: ["id", "username", "fullName"],
            include: [
              {
                model: UserProfile,
                attributes: ["id"],
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
          {
            model: Room,
            attributes: ["id", "name", "slug", "price", "unit", "offerPrice"],
            include: [
              {
                model: User,
                attributes: ["id", "username", "fullName"],
                include: [
                  {
                    model: UserProfile,
                    attributes: ["id"],
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
          },
        ],
      },
    ],
  });

  new ApiResponse({
    status: 200,
    message: review
      ? "Review fetched successfully"
      : "No review found for this room request",
    data: review,
  }).send(res);
};

export default getByRoomRequest;

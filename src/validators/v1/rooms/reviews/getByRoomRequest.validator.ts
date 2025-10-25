import { RoomRequest, RoomReview } from "@/models";
import { param, ValidationChain } from "express-validator";

const getByRoomRequestValidator = (): ValidationChain[] => {
  return [
    param("roomRequestId")
      .exists()
      .withMessage("Room request ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Room request ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const roomRequest = await RoomRequest.findByPk(value);
        if (!roomRequest) {
          throw new Error("Room request not found");
        }
        req.roomRequest = roomRequest;
        return true;
      }),
  ];
};

export default getByRoomRequestValidator;

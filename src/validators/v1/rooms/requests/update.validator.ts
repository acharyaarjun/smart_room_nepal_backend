import { Role, RoomRequestStatus } from "@/enums";
import { Room, RoomRequest } from "@/models";
import { body, param, ValidationChain } from "express-validator";

const updateValidator = (): ValidationChain[] => {
  return [
    param("token")
      .exists()
      .withMessage("Token is required")
      .bail()
      .isString()
      .withMessage("Token must be a string")
      .bail()
      .notEmpty()
      .withMessage("Token cannot be empty")
      .custom(async (value, { req }) => {
        const data = await RoomRequest.findOne({
          where: { token: value },
          include: [
            {
              model: Room,
            },
          ],
        });

        if (!data) {
          throw new Error("Room with this token does not exist");
        }

        if (req.user.role === Role.HOST && data.room.userId !== req.user.id) {
          throw new Error("You are not authorized to update this request");
        }

        if (req.user.role === Role.USER && data.userId !== req.user.id) {
          throw new Error("You are not authorized to update this request");
        }

        req.roomRequest = data;
        return true;
      }),
    body("acceptedPrice")
      .optional()
      .isNumeric()
      .withMessage("Accepted price must be a number")
      .bail()
      .custom((value, { req }) => {
        if (value < 0) {
          throw new Error("Accepted price must be positive");
        }
        req.body.acceptedPrice = value;
        return true;
      }),
    body("status")
      .optional()
      .isIn(Object.values(RoomRequestStatus))
      .withMessage(
        `Status must be one of ${Object.values(RoomRequestStatus).join(", ")}`
      ),
  ];
};
export default updateValidator;

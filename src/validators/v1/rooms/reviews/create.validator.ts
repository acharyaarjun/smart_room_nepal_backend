import { RoomRequestStatus } from "@/enums";
import { Media, RoomRequest, RoomReview } from "@/models";
import { body, param, ValidationChain } from "express-validator";

const createValidator = (): ValidationChain[] => {
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

        // Check if room request belongs to the user
        if (roomRequest.userId !== req.user.id) {
          throw new Error("You are not authorized to review this room request");
        }

        // Check if room request is completed
        if (roomRequest.status !== RoomRequestStatus.COMPLETED) {
          throw new Error("You can only review completed room requests");
        }

        // Check if review already exists
        const existingReview = await RoomReview.findOne({
          where: { roomRequestId: value },
        });
        if (existingReview) {
          throw new Error("You have already reviewed this room request");
        }

        req.roomRequest = roomRequest;
        return true;
      }),
    body("rating")
      .exists()
      .withMessage("Rating is required")
      .bail()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("message")
      .exists()
      .withMessage("Message is required")
      .bail()
      .isString()
      .withMessage("Message must be a string")
      .bail()
      .notEmpty()
      .withMessage("Message cannot be empty")
      .bail()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters")
      .trim(),
    body("mediaId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Media ID must be a positive integer")
      .bail()
      .custom(async (value) => {
        const media = await Media.findByPk(value);
        if (!media) {
          throw new Error("Media not found");
        }
        return true;
      }),
  ];
};

export default createValidator;

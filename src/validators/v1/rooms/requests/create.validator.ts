import { RoomRequestStatus, RoomUnit } from "@/enums";
import { Room, RoomRequest } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const createValidator = (): ValidationChain[] => {
  return [
    param("slug")
      .exists()
      .withMessage("Slug is required")
      .bail()
      .isString()
      .withMessage("Slug must be a string")
      .bail()
      .notEmpty()
      .withMessage("Slug cannot be empty")
      .custom(async (value, { req }) => {
        const room = await Room.findOne({ where: { slug: value } });
        if (!room) {
          throw new Error("Room with this slug does not exist");
        }

        const roomRequest = await RoomRequest.findOne({
          where: {
            roomId: room.id,
            status: RoomRequestStatus.ON_GOING,
          },
        });

        if (roomRequest) {
          throw new Error("Room is not available");
        }

        const anotherCheck = await RoomRequest.findOne({
          where: {
            roomId: room.id,
            userId: req.user.id,
            status: {
              [Op.in]: [RoomRequestStatus.PENDING, RoomRequestStatus.APPROVED],
            },
          },
        });

        if (anotherCheck) {
          throw new Error("You have already requested this room");
        }

        req.room = room;
        return true;
      }),
    body("isFixedDate")
      .optional()
      .isBoolean()
      .withMessage("isFixedDate must be a boolean")
      .custom((value, { req }) => {
        if (!req.room) {
          throw new Error("Room must be specified");
        }
        // only allow isFixedDate is room.unit is RoomUnit.DAY
        if (req.room.unit !== RoomUnit.DAY && value === true) {
          throw new Error(
            "isFixedDate can only be true for rooms with unit DAY"
          );
        }

        if (value && !req.body.startDate && !req.body.endDate) {
          throw new Error(
            "startDate and endDate are required when isFixedDate is true"
          );
        }
        return true;
      }),

    body("startDate")
      .custom((value, { req }) => {
        // Required when isFixedDate is true
        if (req.body.isFixedDate === true) {
          if (!value) {
            throw new Error("startDate is required when isFixedDate is true");
          }
        }
        // Should not be provided when isFixedDate is false
        if (req.body.isFixedDate === false && value) {
          throw new Error(
            "startDate should not be provided when isFixedDate is false"
          );
        }
        return true;
      })
      .optional()
      .isISO8601()
      .withMessage("startDate must be a valid date")
      .toDate(),

    body("endDate")
      .custom((value, { req }) => {
        // Required when isFixedDate is true
        if (req.body.isFixedDate === true) {
          if (!value) {
            throw new Error("endDate is required when isFixedDate is true");
          }
        }
        // Should not be provided when isFixedDate is false
        if (req.body.isFixedDate === false && value) {
          throw new Error(
            "endDate should not be provided when isFixedDate is false"
          );
        }
        return true;
      })
      .optional()
      .isISO8601()
      .withMessage("endDate must be a valid date")
      .toDate()
      .custom((value, { req }) => {
        // Only validate date comparison if both dates are provided
        if (req.body.startDate && value && value <= req.body.startDate) {
          throw new Error("endDate must be after startDate");
        }
        return true;
      }),
    body("message")
      .optional()
      .isString()
      .withMessage("Message must be a string")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Message is too short")
      .trim(),
  ];
};

export default createValidator;

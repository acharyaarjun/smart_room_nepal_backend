import { RoomRequestStatus } from "@/enums";
import { Room, RoomRequest } from "@/models";
import { query, ValidationChain } from "express-validator";

const getByHostValidator = (): ValidationChain[] => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .bail(),
    query("size")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Size must be a positive integer")
      .bail(),
    query("search")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Search query is required")
      .bail()
      .isString()
      .withMessage("Search query must be a string")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Search query must be less than 255 characters")
      .bail()
      .customSanitizer((value) => value.replace(/[^a-zA-Z0-9\s]/g, ""))
      .bail(),
    query("sort")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Sort is required")
      .isString()
      .withMessage("Sort must be a string")
      .bail()
      .custom((value) => {
        // check whether the sort column exists in the model, replace with id if not
        const sortColumn = Object.keys(RoomRequest.getAttributes()).includes(
          value
        );
        if (!sortColumn) {
          throw new Error("Invalid sort column");
        }

        return true;
      })
      .bail(),
    query("order")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Order is required")
      .bail()
      .isString()
      .withMessage("Order must be a string")
      .isIn(["asc", "desc", "ASC", "DESC"])
      .withMessage("Invalid order value")
      .bail()
      .custom((value, { req }) => {
        req.query!.orderBy = value.toLowerCase();
        return true;
      }),
    query("room")
      .optional()
      .isString()
      .withMessage("Room slug must be a string")
      .bail()
      .customSanitizer((value) => value.trim().toLowerCase())
      .custom(async (value, { req }) => {
        // Check if room exists
        const room = await Room.findOne({ where: { slug: value } });
        if (!room) {
          throw new Error("Room not found");
        }

        if (room.userId !== req.user.id) {
          throw new Error("You are not the host of this room");
        }

        req.room = room;
        return true;
      }),
    query("roomRequestStatus")
      .optional()
      .isIn(Object.values(RoomRequestStatus))
      .withMessage(
        `Room request status must be one of the following: ${Object.values(
          RoomRequestStatus
        ).join(", ")}`
      ),
  ];
};
export default getByHostValidator;

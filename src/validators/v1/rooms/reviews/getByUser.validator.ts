import { Room, RoomReview } from "@/models";
import { query, ValidationChain } from "express-validator";

const getByUserValidator = (): ValidationChain[] => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("size")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Size must be a positive integer"),
    query("sort")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Sort is required")
      .bail()
      .isString()
      .withMessage("Sort must be a string")
      .bail()
      .custom((value) => {
        const sortColumn = Object.keys(RoomReview.getAttributes()).includes(
          value
        );
        if (!sortColumn) {
          throw new Error("Invalid sort column");
        }
        return true;
      }),
    query("order")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Order is required")
      .bail()
      .isString()
      .withMessage("Order must be a string")
      .bail()
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
        const room = await Room.findOne({ where: { slug: value } });
        if (!room) {
          throw new Error("Room not found");
        }
        req.room = room;
        return true;
      }),
    query("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ];
};

export default getByUserValidator;

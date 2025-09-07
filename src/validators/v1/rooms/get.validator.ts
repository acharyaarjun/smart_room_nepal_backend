import { MaxCapacity, RoomType } from "@/enums";
import { District, Room } from "@/models";
import { query, ValidationChain } from "express-validator";

const getValidator = (): ValidationChain[] => {
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
        const sortColumn = Object.keys(Room.getAttributes()).includes(value);
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
    query("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("isFeatured must be a boolean value")
      .bail()
      .toBoolean(),
    query("minPrice")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("minPrice must be a number greater than 0")
      .bail()
      .toFloat(),
    query("maxPrice")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("maxPrice must be a number greater than 0")
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        if (!req.query) return true;
        if (req.query.minPrice && value < Number(req.query.minPrice)) {
          throw new Error("maxPrice must be greater than minPrice");
        }
        return true;
      }),
    query("roomType")
      .optional()
      .isIn(Object.values(RoomType))
      .withMessage(
        `Room type must be one of the following: ${Object.values(RoomType).join(
          ", "
        )}`
      ),
    query("district")
      .optional()
      .isString()
      .withMessage("District slug must be a string")
      .bail()
      .isLength({ max: 100 })
      .withMessage("District slug must be less than 100 characters")
      .bail()
      .customSanitizer((value) => value.trim().toLowerCase())
      .custom(async (value, { req }) => {
        // Check if district exists
        const district = await District.findOne({ where: { slug: value } });
        if (!district) {
          throw new Error("District not found");
        }
        req.district = district;
        return true;
      }),
    query("maxCapacity")
      .optional()
      .isIn(Object.values(MaxCapacity))
      .withMessage(
        `Max capacity must be one of the following: ${Object.values(
          MaxCapacity
        ).join(", ")}`
      ),
  ];
};
export default getValidator;

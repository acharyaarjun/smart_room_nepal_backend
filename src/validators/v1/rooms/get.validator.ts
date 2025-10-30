import { MaxCapacity, RoomType } from "@/enums";
import { Amenity, District, Room } from "@/models";
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
    query("districts")
      .optional()
      .isString()
      .withMessage("Districts must be a string")
      .bail()
      .customSanitizer((value) => {
        // Split by comma and trim each value
        return value
          .split(",")
          .map((d: string) => d.trim().toLowerCase())
          .filter((d: string) => d.length > 0);
      })
      .custom(async (value: string[], { req }) => {
        if (!value || value.length === 0) {
          return true;
        }

        // Check if all districts exist
        const districts = await District.findAll({
          where: { slug: value },
        });

        if (districts.length === 0) {
          throw new Error("No valid districts found");
        }

        // Store found districts in request for controller use
        req.districts = districts;
        return true;
      }),
    query("amenities")
      .optional()
      .isString()
      .withMessage("Amenities must be a string")
      .bail()
      .customSanitizer((value) => {
        // Split by comma, trim, and convert to numbers
        return value
          .split(",")
          .map((id: string) => parseInt(id.trim()))
          .filter((id: number) => !isNaN(id) && id > 0);
      })
      .custom(async (value: number[], { req }) => {
        if (!value || value.length === 0) {
          return true;
        }

        // Check if all amenities exist
        const amenities = await Amenity.findAll({
          where: { id: value },
        });

        if (amenities.length === 0) {
          throw new Error("No valid amenities found");
        }

        // Store found amenity IDs in request for controller use
        req.amenityIds = amenities.map((a) => a.id);
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
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a valid number between -90 and 90")
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        // If latitude is provided, longitude must also be provided
        if (value && !req.query?.longitude) {
          throw new Error("Longitude is required when latitude is provided");
        }
        return true;
      }),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a valid number between -180 and 180")
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        // If longitude is provided, latitude must also be provided
        if (value && !req.query?.latitude) {
          throw new Error("Latitude is required when longitude is provided");
        }
        return true;
      }),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage(
        "Radius must be a number between 0.1 and 100 (in kilometers)"
      )
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        // Radius can only be used with latitude and longitude
        if (value && (!req.query?.latitude || !req.query?.longitude)) {
          throw new Error(
            "Radius requires both latitude and longitude parameters"
          );
        }
        return true;
      }),
  ];
};
export default getValidator;

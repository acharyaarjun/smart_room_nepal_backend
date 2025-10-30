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
    query("sort")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Sort is required")
      .isString()
      .withMessage("Sort must be a string")
      .bail()
      .isIn(["createdAt", "updatedAt"])
      .withMessage("Invalid sort column")
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
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90")
      .bail()
      .custom((value, { req }) => {
        if (value && !req.query?.longitude) {
          throw new Error("Longitude is required when latitude is provided");
        }
        return true;
      }),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180")
      .bail()
      .custom((value, { req }) => {
        if (value && !req.query?.latitude) {
          throw new Error("Latitude is required when longitude is provided");
        }
        return true;
      }),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage("Radius must be a number between 0.1 and 100 km")
      .bail()
      .custom((value, { req }) => {
        if (value && (!req.query?.latitude || !req.query?.longitude)) {
          throw new Error(
            "Latitude and longitude are required when radius is provided"
          );
        }
        return true;
      }),
  ];
};

export default getValidator;

import { Role, UserStatus } from "@/enums";
import { User } from "@/models";
import { query, ValidationChain } from "express-validator";

const getByAdminValidator = (): ValidationChain[] => {
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
        const sortColumn = Object.keys(User.getAttributes()).includes(value);
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
    query("role")
      .optional()
      .isIn(Object.values(Role))
      .withMessage(
        `Role must be one of the following: ${Object.values(Role).join(", ")}`
      ),
    query("isEmailVerified")
      .optional()
      .isBoolean()
      .withMessage("isEmailVerified must be a boolean value")
      .bail()
      .toBoolean(),
    query("isEnabled")
      .optional()
      .isBoolean()
      .withMessage("isEnabled must be a boolean value")
      .bail()
      .toBoolean(),
    query("status")
      .optional()
      .isIn(Object.values(UserStatus))
      .withMessage(
        `Status must be one of the following: ${Object.values(UserStatus).join(
          ", "
        )}`
      ),
  ];
};

export default getByAdminValidator;

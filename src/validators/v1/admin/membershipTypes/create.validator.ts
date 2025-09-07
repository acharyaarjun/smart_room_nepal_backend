import { MembershipType } from "@/models";
import { body, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const createValidator = (): ValidationChain[] => {
  return [
    body("name")
      .exists()
      .withMessage("Name is required")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Name is too short")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Name is too long")
      .bail()
      .trim()
      .custom(async (value, { req }) => {
        const alreadyExists = await MembershipType.findOne({
          where: {
            name: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
          },
        });

        if (alreadyExists) {
          throw new Error("Membership type with this name already exists");
        }

        return true;
      }),
    body("description")
      .exists()
      .withMessage("Description is required")
      .bail()
      .isString()
      .withMessage("Description must be a string")
      .bail(),
    body("limit")
      .exists()
      .withMessage("Limit is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer")
      .bail(),
    body("price")
      .exists()
      .withMessage("Price is required")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number")
      .bail(),
    body("features")
      .exists()
      .withMessage("Features is required")
      .bail()
      .isString()
      .withMessage("Features must be a string")
      .bail(),
  ];
};

export default createValidator;

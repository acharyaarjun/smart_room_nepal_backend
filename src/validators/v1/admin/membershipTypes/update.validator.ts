import { MembershipType } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const updateValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("MembershipType ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("MembershipType ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await MembershipType.findByPk(value);

        if (!data) {
          throw new Error("MembershipType with this ID does not exist");
        }

        req.membershipType = data;
        return true;
      }),
    body("name")
      .optional()
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
            id: { [Op.ne]: req.membershipType.id },
          },
        });

        if (alreadyExists) {
          throw new Error("MembershipType with this name already exists");
        }

        return true;
      }),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .bail(),
    body("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer")
      .bail(),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number")
      .bail(),
    body("features")
      .optional()
      .isString()
      .withMessage("Features must be a string")
      .bail(),
  ];
};

export default updateValidator;

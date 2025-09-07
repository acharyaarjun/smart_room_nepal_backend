import { District } from "@/models";
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
        const alreadyExists = await District.findOne({
          where: {
            name: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
          },
        });

        if (alreadyExists) {
          throw new Error("District with this name already exists");
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
  ];
};

export default createValidator;

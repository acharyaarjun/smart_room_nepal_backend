import { Amenity } from "@/models";
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
        const alreadyExists = await Amenity.findOne({
          where: {
            name: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
          },
        });

        if (alreadyExists) {
          throw new Error("Amenity with this name already exists");
        }

        return true;
      }),
    body("icon")
      .exists()
      .withMessage("Icon is required")
      .bail()
      .isString()
      .withMessage("Icon must be a string")
      .bail(),
  ];
};

export default createValidator;

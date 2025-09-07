import { Amenity } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const updateValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("Amenity ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("Amenity ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await Amenity.findByPk(value);

        if (!data) {
          throw new Error("Amenity with this ID does not exist");
        }

        req.amenity = data;
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
        const alreadyExists = await Amenity.findOne({
          where: {
            name: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
            id: { [Op.ne]: req.amenity.id },
          },
        });

        if (alreadyExists) {
          throw new Error("Amenity with this name already exists");
        }

        return true;
      }),
    body("icon")
      .optional()
      .isString()
      .withMessage("Icon must be a string")
      .bail(),
  ];
};

export default updateValidator;

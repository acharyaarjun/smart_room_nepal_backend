import { District } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const updateValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("District ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("District ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await District.findByPk(value);

        if (!data) {
          throw new Error("District with this ID does not exist");
        }

        req.district = data;
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
        const alreadyExists = await District.findOne({
          where: {
            name: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
            id: { [Op.ne]: req.district.id },
          },
        });

        if (alreadyExists) {
          throw new Error("District with this name already exists");
        }

        return true;
      }),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .bail(),
  ];
};

export default updateValidator;

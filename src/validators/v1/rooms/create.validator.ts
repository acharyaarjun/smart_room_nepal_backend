import { MaxCapacity, Role, RoomStatus, RoomType, RoomUnit } from "@/enums";
import { District, Room, User } from "@/models";
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
      .trim(),
    body("userId")
      .optional()
      .isInt({ gt: 0 })
      .withMessage("User ID must be a number greater than 0")
      .bail()
      .custom(async (value, { req }) => {
        if (req.user.role !== Role.ADMIN) {
          throw new Error("You are not authorized to set userId");
        }

        const user = await User.findByPk(value);
        if (!user) {
          throw new Error("User not found");
        }

        if (user.role !== Role.HOST) {
          throw new Error("User is not a host");
        }

        return true;
      }),

    body("slug")
      .optional()
      .isString()
      .withMessage("Slug must be a string")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Slug is too short")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Slug is too long")
      .bail()
      .trim()
      .custom(async (value, { req }) => {
        const alreadyExists = await Room.findOne({
          where: {
            slug: {
              [Op.in]: [value, value.toLowerCase(), value.toUpperCase()],
            },
          },
        });

        if (alreadyExists) {
          throw new Error("Room with this slug already exists");
        }

        return true;
      }),
    body("shortDescription")
      .exists()
      .withMessage("Short description is required")
      .bail()
      .isString()
      .withMessage("Short description must be a string")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Short description is too short")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Short description is too long")
      .bail()
      .trim(),
    body("description")
      .exists()
      .withMessage("Description is required")
      .bail()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ min: 20 })
      .withMessage("Description is too short")
      .bail()
      .trim(),
    body("price")
      .exists()
      .withMessage("Price is required")
      .bail()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a number greater than 0")
      .bail()
      .toFloat(),
    body("offerPrice")
      .optional({ nullable: true })
      .isFloat({ gt: 0 })
      .withMessage("Offer price must be a number greater than 0")
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        if (value >= req.body.price) {
          throw new Error("Offer price must be less than price");
        }
        return true;
      }),
    body("unit")
      .exists()
      .withMessage("Unit is required")
      .bail()
      .isIn(Object.values(RoomUnit))
      .withMessage(
        `Unit must be one of the following: ${Object.values(RoomUnit).join(
          ", "
        )}`
      ),
    body("districtId")
      .exists()
      .withMessage("District ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("District ID must be a number greater than 0")
      .bail()
      .toInt()
      .custom(async (value, { req }) => {
        // Check if district exists
        const district = await District.findByPk(value);
        if (!district) {
          throw new Error("District not found");
        }
        return true;
      }),
    body("longitude")
      .optional({ nullable: true })
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180")
      .bail()
      .toFloat(),
    body("latitude")
      .optional({ nullable: true })
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90")
      .bail()
      .toFloat(),
    body("address")
      .exists()
      .withMessage("Address is required")
      .bail()
      .isString()
      .withMessage("Address must be a string")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Address is too short")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Address is too long")
      .bail()
      .trim(),
    body("roomType")
      .exists()
      .withMessage("Room type is required")
      .bail()
      .isString()
      .withMessage("Room type must be a string")
      .bail()
      .isIn(Object.values(RoomType))
      .withMessage(
        `Room type must be one of the following: ${Object.values(RoomType).join(
          ", "
        )}`
      ),
    body("maxCapacity")
      .exists()
      .withMessage("Max capacity is required")
      .bail()
      .isString()
      .withMessage("Max capacity must be a string")
      .bail()
      .isIn(Object.values(MaxCapacity))
      .withMessage(
        `Max capacity must be one of the following: ${Object.values(
          MaxCapacity
        ).join(", ")}`
      ),
    body("roomStatus")
      .optional()
      .isString()
      .withMessage("Room status must be a string")
      .bail()
      .isIn(Object.values(RoomStatus))
      .withMessage(
        `Room status must be one of the following: ${Object.values(
          RoomStatus
        ).join(", ")}`
      ),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("IsFeatured must be a boolean"),
  ];
};
export default createValidator;

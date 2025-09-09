import { MaxCapacity, Role, RoomStatus, RoomType, RoomUnit } from "@/enums";
import { District, Room } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const updateValidator = (): ValidationChain[] => {
  return [
    param("slug")
      .exists()
      .withMessage("Slug is required")
      .bail()
      .isString()
      .withMessage("Slug must be a string")
      .bail()
      .notEmpty()
      .withMessage("Slug cannot be empty")
      .custom(async (value, { req }) => {
        // Check if room with the slug exists
        const room = await Room.findOne({ where: { slug: value } });
        if (!room) {
          throw new Error("Room with this slug does not exist");
        }

        req.room = room;
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
      .bail(),
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
            id: { [Op.ne]: req.room.id },
          },
        });

        if (alreadyExists) {
          throw new Error("Room with this slug already exists");
        }

        return true;
      }),

    body("shortDescription")
      .optional()
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
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ min: 20 })
      .withMessage("Description is too short")
      .bail()
      .trim(),
    body("unit")
      .optional()
      .isString()
      .withMessage("Unit must be a string")
      .bail()
      .isIn(Object.values(RoomUnit))
      .withMessage(
        `Unit must be one of the following: ${Object.values(RoomUnit).join(
          ", "
        )}`
      ),
    body("price")
      .optional()
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("Price must be a decimal number with up to 2 decimal places")
      .bail()
      .toFloat(),
    body("offerPrice")
      .optional()
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage(
        "Offer price must be a decimal number with up to 2 decimal places"
      )
      .bail()
      .toFloat()
      .custom((value, { req }) => {
        if (!req.body.price) {
          if (value >= req.room.price) {
            throw new Error("Offer price must be less than the price");
          }
        } else {
          if (value >= req.body.price) {
            throw new Error("Offer price must be less than the price");
          }
        }
        return true;
      }),
    body("districtId")
      .optional()
      .isInt({ gt: 0 })
      .withMessage("District ID must be a positive integer")
      .bail()
      .toInt()
      .custom(async (value) => {
        const district = await District.findByPk(value);
        if (!district) {
          throw new Error("District with this ID does not exist");
        }
        return true;
      }),
    body("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180")
      .bail()
      .toFloat(),
    body("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90")
      .bail()
      .toFloat(),
    body("address")
      .optional()
      .isString()
      .withMessage("Address must be a string")
      .bail()
      .isLength({ min: 5 })
      .withMessage("Address is too short")
      .bail()
      .isLength({ max: 500 })
      .withMessage("Address is too long")
      .bail()
      .trim(),
    body("roomType")
      .optional()
      .isIn(Object.values(RoomType))
      .withMessage(
        `Room type must be one of the following: ${Object.values(RoomType).join(
          ", "
        )}`
      ),
    body("maxCapacity")
      .optional()
      .isIn(Object.values(MaxCapacity))
      .withMessage(
        `Max capacity must be one of the following: ${Object.values(
          MaxCapacity
        ).join(", ")}`
      ),
    body("roomStatus")
      .optional()
      .custom((value, { req }) => {
        if (req.user.role !== Role.ADMIN) {
          throw new Error("You are not authorized to set room status");
        }
        if (!Object.values(RoomStatus).includes(value)) {
          throw new Error(
            `Room status must be one of the following: ${Object.values(
              RoomStatus
            ).join(", ")}`
          );
        }
        return true;
      }),
    body("isFeatured")
      .optional()
      .custom((value, { req }) => {
        if (req.user.role !== Role.ADMIN) {
          throw new Error("You are not authorized to set isFeatured");
        }
        if (typeof value !== "boolean") {
          throw new Error("isFeatured must be a boolean");
        }
        return true;
      }),
  ];
};
export default updateValidator;

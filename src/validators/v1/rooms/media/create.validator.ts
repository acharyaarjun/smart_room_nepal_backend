import { Role } from "@/enums";
import { Room } from "@/models";
import { param, ValidationChain } from "express-validator";

const createValidator = (): ValidationChain[] => {
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

        if (req.user.role === Role.HOST && room.userId !== req.user.id) {
          throw new Error(
            "You are not authorized to add amenities to this room"
          );
        }

        req.room = room;
        return true;
      }),
  ];
};

export default createValidator;

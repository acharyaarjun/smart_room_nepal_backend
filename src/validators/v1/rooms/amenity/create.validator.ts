import { Role } from "@/enums";
import { Amenity, Room, RoomAmenity } from "@/models";
import { body, param, ValidationChain } from "express-validator";

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
    body("amenityId")
      .exists()
      .withMessage("Amenity ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("Amenity ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const amenity = await Amenity.findByPk(value);
        if (!amenity) {
          throw new Error("Amenity with this ID does not exist");
        }

        const alreadyAdded = await RoomAmenity.findOne({
          where: {
            roomId: req.room.id,
            amenityId: value,
          },
        });

        if (alreadyAdded) {
          throw new Error("This amenity is already added to the room");
        }

        req.amenity = amenity;
        return true;
      }),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Description is too long")
      .bail()
      .trim(),
  ];
};

export default createValidator;

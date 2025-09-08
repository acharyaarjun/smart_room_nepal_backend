import { Role } from "@/enums";
import { Amenity, Room, RoomAmenity } from "@/models";
import { body, param, ValidationChain } from "express-validator";
import { Op } from "sequelize";

const updateValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("Room Amenity ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("Room Amenity ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await RoomAmenity.findByPk(value, {
          include: [{ model: Room }],
        });

        if (!data) {
          throw new Error("Room Amenity with this ID does not exist");
        }

        if (req.user.role === Role.HOST && data.room.userId !== req.user.id) {
          throw new Error("You are not authorized to update this room amenity");
        }

        req.roomAmenity = data;
        return true;
      }),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Description must be less than 255 characters")
      .bail()
      .trim(),
    body("amenityId")
      .optional()
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
            roomId: req.roomAmenity.roomId,
            amenityId: value,
            id: { [Op.ne]: req.roomAmenity.id },
          },
        });

        if (alreadyAdded) {
          throw new Error("This amenity is already added to the room");
        }

        req.amenity = amenity;
        return true;
      }),
  ];
};

export default updateValidator;

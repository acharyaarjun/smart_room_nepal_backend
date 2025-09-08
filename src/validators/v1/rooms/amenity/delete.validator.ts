import { Role } from "@/enums";
import { Room, RoomAmenity } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
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
          include: [
            {
              model: Room,
              attributes: ["id", "userId"],
            },
          ],
        });

        if (!data) {
          throw new Error("Room Amenity with this ID does not exist");
        }

        if (req.user.role === Role.HOST && data.room.userId !== req.user.id) {
          throw new Error("You are not authorized to delete this room amenity");
        }

        req.roomAmenity = data;
        return true;
      }),
  ];
};

export default deleteValidator;

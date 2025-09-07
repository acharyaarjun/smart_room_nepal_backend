import { Amenity, RoomAmenity } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
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

        const associatedRooms = await RoomAmenity.count({
          where: {
            amenityId: value,
          },
        });

        if (associatedRooms > 0) {
          throw new Error(
            "Amenity cannot be deleted as it is associated with one or more rooms"
          );
        }

        req.amenity = data;
        return true;
      }),
  ];
};

export default deleteValidator;

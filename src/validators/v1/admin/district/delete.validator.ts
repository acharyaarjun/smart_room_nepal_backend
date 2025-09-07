import { District, Room } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
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

        const associatedRooms = await Room.count({
          where: {
            districtId: value,
          },
        });

        if (associatedRooms > 0) {
          throw new Error(
            "District cannot be deleted as it is associated with one or more rooms"
          );
        }

        req.district = data;
        return true;
      }),
  ];
};

export default deleteValidator;

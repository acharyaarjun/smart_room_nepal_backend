import { Role } from "@/enums";
import { Room, RoomMedia } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("Room Media ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("Room Media ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await RoomMedia.findByPk(value, {
          include: [
            {
              model: Room,
              attributes: ["id", "userId"],
            },
          ],
        });

        if (!data) {
          throw new Error("Room Media with this ID does not exist");
        }

        if (req.user.role === Role.HOST && data.room.userId !== req.user.id) {
          throw new Error("You are not authorized to delete this room Media");
        }

        req.roomMedia = data;
        return true;
      }),
  ];
};

export default deleteValidator;

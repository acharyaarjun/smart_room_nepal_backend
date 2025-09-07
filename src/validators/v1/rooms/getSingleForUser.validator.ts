import { Room } from "@/models";
import { param, ValidationChain } from "express-validator";

const getSingleForUserValidator = (): ValidationChain[] => {
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
  ];
};
export default getSingleForUserValidator;

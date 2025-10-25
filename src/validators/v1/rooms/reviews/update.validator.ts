import { Media, RoomReview } from "@/models";
import { body, param, ValidationChain } from "express-validator";

const updateValidator = (): ValidationChain[] => {
  return [
    param("reviewId")
      .exists()
      .withMessage("Review ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Review ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const review = await RoomReview.findByPk(value, {
          include: [
            {
              association: "roomRequest",
              attributes: ["userId"],
            },
          ],
        });
        if (!review) {
          throw new Error("Review not found");
        }

        // Check if review belongs to the user
        if (review.roomRequest.userId !== req.user.id) {
          throw new Error("You are not authorized to update this review");
        }

        req.review = review;
        return true;
      }),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("message")
      .optional()
      .isString()
      .withMessage("Message must be a string")
      .bail()
      .notEmpty()
      .withMessage("Message cannot be empty")
      .bail()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters")
      .trim(),
    body("mediaId")
      .optional()
      .custom(async (value) => {
        if (value === null) {
          return true; // Allow null to remove media
        }
        if (!Number.isInteger(value) || value < 1) {
          throw new Error("Media ID must be a positive integer");
        }
        const media = await Media.findByPk(value);
        if (!media) {
          throw new Error("Media not found");
        }
        return true;
      }),
  ];
};

export default updateValidator;

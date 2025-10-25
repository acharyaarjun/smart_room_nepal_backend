import { RoomReview } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
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
          throw new Error("You are not authorized to delete this review");
        }

        req.review = review;
        return true;
      }),
  ];
};

export default deleteValidator;

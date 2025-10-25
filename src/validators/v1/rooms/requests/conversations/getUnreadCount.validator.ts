import { param, ValidationChain } from "express-validator";

const getUnreadCountValidator = (): ValidationChain[] => {
  return [
    param("roomRequestId")
      .notEmpty()
      .withMessage("Room request ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Room request ID must be a positive integer")
      .bail(),
  ];
};

export default getUnreadCountValidator;

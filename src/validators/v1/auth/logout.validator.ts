import { header, ValidationChain } from "express-validator";

const logoutValidator = (): ValidationChain[] => {
  return [
    header("Authorization")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Authorization header is required")
      .bail()
      .isString()
      .withMessage("Authorization header must be a string")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Authorization header must be at least 10 characters")
      .bail()
      .custom((value) => {
        const isBearer = value.startsWith("Bearer ");

        if (!isBearer) {
          throw new Error("Authorization header must start with 'Bearer '");
        }
        return true;
      }),
  ];
};

export default logoutValidator;

import { body, ValidationChain } from "express-validator";

const loginValidator = (): ValidationChain[] => {
  return [
    body("email")
      .exists()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email address")
      .bail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .bail()
      .bail()
      .trim()
      .notEmpty()
      .notEmpty()
      .withMessage("Password is required")
      .bail(),
  ];
};

export default loginValidator;

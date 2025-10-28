import { body, ValidationChain } from "express-validator";

const changePasswordValidator = (): ValidationChain[] => {
  return [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .bail()
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }
        return true;
      }),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Confirm password is required")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
};

export default changePasswordValidator;

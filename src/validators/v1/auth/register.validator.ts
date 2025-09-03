import { body, ValidationChain } from "express-validator";
import { User } from "@/models";
import { validatePassword } from "@/utils/passwordUtil";

const registerValidator = (): ValidationChain[] => {
  return [
    body("email")
      .exists()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email address")
      .bail()
      .custom(async (email) => {
        const user = await User.findOne({
          where: {
            email,
          },
        });

        if (user) {
          throw new Error("Email already exists");
        }
        return true;
      }),
    body("password")
      .exists()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .bail()
      .custom((password) => {
        if (!validatePassword(password)) {
          throw new Error(
            "Password must contain at least one uppercase, one lowercase, one number and one special character"
          );
        }
        return true;
      }),
    body("confirmPassword")
      .exists()
      .withMessage("Confirm password is required")
      .bail()
      .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    body("fullName")
      .exists()
      .withMessage("Full name is required")
      .bail()
      .trim()
      .isString()
      .withMessage("Full name must be a string")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Full name must be at least 3 characters")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Full name must be at most 255 characters")
      .bail()
      .matches(/^[a-zA-Z ]+$/)
      .withMessage("Full name must contain only alphabets and spaces")
      .bail(),
  ];
};

export default registerValidator;

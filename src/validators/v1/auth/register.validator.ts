import { body, ValidationChain } from "express-validator";
import { User } from "@/models";
import { validatePassword } from "@/utils/passwordUtil";
import { Gender, MaritalStatus, OccupationStatus, Role } from "@/enums";

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
    body("username")
      .optional()
      .trim()
      .isString()
      .withMessage("Username must be a string")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .bail()
      .isLength({ max: 50 })
      .withMessage("Username must be at most 50 characters")
      .bail()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username must contain only alphanumeric characters and underscores"
      )
      .bail()
      .custom(async (username) => {
        const user = await User.findOne({
          where: {
            username,
          },
        });

        if (user) {
          throw new Error("Username already exists");
        }
        return true;
      }),
    body("gender")
      .exists()
      .withMessage("Gender is required")
      .bail()
      .isIn(Object.values(Gender))
      .withMessage(`Gender must be one of ${Object.values(Gender).join(", ")}`),
    body("dob")
      .exists()
      .withMessage("Date of birth is required")
      .bail()
      .isDate()
      .withMessage("Invalid date format")
      .bail()
      .custom((dob) => {
        const today = new Date();
        const age = today.getFullYear() - new Date(dob).getFullYear();
        if (age < 0 || (age === 0 && today < new Date(dob))) {
          throw new Error("Invalid date of birth");
        }
        return true;
      }),
    body("phone")
      .exists()
      .withMessage("Phone number is required")
      .bail()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    body("occupationStatus")
      .exists()
      .withMessage("Occupation status is required")
      .bail()
      .isString()
      .withMessage("Occupation status must be a string")
      .bail()
      .isIn(Object.values(OccupationStatus))
      .withMessage(
        `Occupation status must be one of ${Object.values(
          OccupationStatus
        ).join(", ")}`
      ),
    body("maritalStatus")
      .exists()
      .withMessage("Marital status is required")
      .bail()
      .isString()
      .withMessage("Marital status must be a string")
      .bail()
      .isIn(Object.values(MaritalStatus))
      .withMessage(
        `Marital status must be one of ${Object.values(MaritalStatus).join(
          ", "
        )}`
      ),
    body("role")
      .optional()
      .isString()
      .withMessage("Role must be a string")
      .bail()
      // role.USER and role.HOST are allowed, but not role.ADMIN
      .isIn([Role.USER, Role.HOST])
      .withMessage("Role must be either user or host"),
  ];
};

export default registerValidator;

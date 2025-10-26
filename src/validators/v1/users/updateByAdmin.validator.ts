import { Gender, MaritalStatus, OccupationStatus, UserStatus } from "@/enums";
import { User } from "@/models";
import { body, param, ValidationChain } from "express-validator";

const updateByAdminValidator = (): ValidationChain[] => {
  return [
    param("userId")
      .exists()
      .withMessage("User ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("User ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const user = await User.findByPk(value);
        if (!user) {
          throw new Error("User not found");
        }
        req.targetUser = user;
        return true;
      }),
    // User table fields that admin can update
    body("username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Username cannot be empty")
      .bail()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .bail()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      )
      .bail()
      .custom(async (value, { req }) => {
        const existingUser = await User.findOne({ where: { username: value } });
        if (existingUser && existingUser.id !== Number(req.params!.userId)) {
          throw new Error("Username already exists");
        }
        return true;
      }),
    body("fullName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Full name cannot be empty")
      .bail()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    body("isEnabled")
      .optional()
      .isBoolean()
      .withMessage("isEnabled must be a boolean value")
      .bail()
      .toBoolean(),
    // UserProfile fields that admin can update
    body("phone")
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone number must be 10 digits"),
    body("gender")
      .optional()
      .isIn(Object.values(Gender))
      .withMessage(
        `Gender must be one of the following: ${Object.values(Gender).join(
          ", "
        )}`
      ),
    body("dob")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date")
      .bail()
      .custom((value) => {
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18 || age > 120) {
          throw new Error("Age must be between 18 and 120");
        }
        return true;
      }),
    body("occupationStatus")
      .optional()
      .isIn(Object.values(OccupationStatus))
      .withMessage(
        `Occupation status must be one of the following: ${Object.values(
          OccupationStatus
        ).join(", ")}`
      ),
    body("maritalStatus")
      .optional()
      .isIn(Object.values(MaritalStatus))
      .withMessage(
        `Marital status must be one of the following: ${Object.values(
          MaritalStatus
        ).join(", ")}`
      ),
    body("status")
      .optional()
      .isIn(Object.values(UserStatus))
      .withMessage(
        `Status must be one of the following: ${Object.values(UserStatus).join(
          ", "
        )}`
      ),
  ];
};

export default updateByAdminValidator;

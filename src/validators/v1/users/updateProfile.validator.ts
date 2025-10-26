import { Gender, MaritalStatus, OccupationStatus } from "@/enums";
import { body, ValidationChain } from "express-validator";

const updateProfileValidator = (): ValidationChain[] => {
  return [
    body("fullName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Full name cannot be empty")
      .bail()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
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
  ];
};

export default updateProfileValidator;

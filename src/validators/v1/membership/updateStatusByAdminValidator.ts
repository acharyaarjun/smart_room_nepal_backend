import { body, param } from "express-validator";
import { PaymentStatus } from "@/enums";

const updateStatusByAdminValidator = () => {
  return [
    param("paymentId")
      .notEmpty()
      .withMessage("Payment ID is required")
      .isInt({ min: 1 })
      .withMessage("Payment ID must be a positive integer"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(Object.values(PaymentStatus))
      .withMessage(
        `Status must be one of: ${Object.values(PaymentStatus).join(", ")}`
      ),
    body("remarks")
      .optional()
      .isString()
      .withMessage("Remarks must be a string")
      .isLength({ max: 500 })
      .withMessage("Remarks cannot exceed 500 characters"),
  ];
};

export default updateStatusByAdminValidator;

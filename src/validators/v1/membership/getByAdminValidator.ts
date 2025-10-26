import { query } from "express-validator";
import { PaymentStatus, PaymentMethod } from "@/enums";

const getByAdminValidator = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("size")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Size must be between 1 and 100"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("sortBy")
      .optional()
      .isString()
      .withMessage("SortBy must be a string"),
    query("orderBy")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("OrderBy must be either asc or desc"),
    query("status")
      .optional()
      .isIn(Object.values(PaymentStatus))
      .withMessage(
        `Status must be one of: ${Object.values(PaymentStatus).join(", ")}`
      ),
    query("userId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("UserId must be a positive integer"),
    query("membershipTypeId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("MembershipTypeId must be a positive integer"),
    query("paymentMethod")
      .optional()
      .isIn(Object.values(PaymentMethod))
      .withMessage(
        `PaymentMethod must be one of: ${Object.values(PaymentMethod).join(
          ", "
        )}`
      ),
  ];
};

export default getByAdminValidator;

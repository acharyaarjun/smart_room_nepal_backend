import { MembershipType, Payment } from "@/models";
import { param, ValidationChain } from "express-validator";

const deleteValidator = (): ValidationChain[] => {
  return [
    param("id")
      .exists()
      .withMessage("MembershipType ID is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("MembershipType ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        const data = await MembershipType.findByPk(value);

        if (!data) {
          throw new Error("MembershipType with this ID does not exist");
        }

        const associatedPayments = await Payment.count({
          where: {
            membershipTypeId: value,
          },
        });

        if (associatedPayments > 0) {
          throw new Error(
            "MembershipType cannot be deleted as it is associated with one or more payments"
          );
        }

        req.membershipType = data;
        return true;
      }),
  ];
};

export default deleteValidator;

import { MembershipType } from "@/models";
import { body, ValidationChain } from "express-validator";

const createMembershipValidator = (): ValidationChain[] => {
  return [
    body("membershipTypeId")
      .exists()
      .withMessage("Membership type ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Membership type ID must be a positive integer")
      .bail()
      .custom(async (value, { req }) => {
        // Check if membership type exists
        const membershipType = await MembershipType.findByPk(value);
        if (!membershipType) {
          throw new Error("Membership type not found");
        }

        req.membershipType = membershipType;
        return true;
      }),
  ];
};

export default createMembershipValidator;

import { Request, Response } from "express";
import { MembershipType, Payment, User } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";
import { PaymentMethod, PaymentStatus } from "@/enums";
import { createKhaltiPaymentURL } from "@/utils/khaltiUtil";

const createMembership = async (req: Request, res: Response) => {
  const { membershipTypeId } = req.body;
  const user: User = req.user!;

  // Validate membershipTypeId
  if (!membershipTypeId) {
    throw new ApiError({
      status: 400,
      message: "Membership type ID is required",
      errors: [
        {
          membershipTypeId: "Membership type ID is required",
        },
      ],
    });
  }

  // Find the membership type
  const membershipType = await MembershipType.findByPk(membershipTypeId);

  if (!membershipType) {
    throw new ApiError({
      status: 404,
      message: "Membership type not found",
    });
  }

  try {
    // Create Khalti payment URL
    const paymentDetail = await createKhaltiPaymentURL(membershipType, user);

    // Create payment record
    await Payment.create({
      userId: user.id,
      membershipTypeId: membershipType.id,
      amount: membershipType.price,
      paymentMethod: PaymentMethod.KHALTI,
      status: PaymentStatus.PENDING,
      transactionId: paymentDetail.pidx,
      paymentDate: new Date(),
      // Set expiry date to 1 year from now (you can adjust this based on your business logic)
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    new ApiResponse({
      status: 200,
      data: {
        paymentUrl: paymentDetail.payment_url,
        pidx: paymentDetail.pidx,
        expiresAt: paymentDetail.expires_at,
        expiresIn: paymentDetail.expires_in,
      },
      message: "Payment initiated successfully. Please complete the payment.",
    }).send(res);
  } catch (error: any) {
    console.error("Payment creation error:", error);
    throw new ApiError({
      status: 500,
      message: error.message || "Failed to create payment",
    });
  }
};

export default createMembership;

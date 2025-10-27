import { Request, Response } from "express";
import { Payment, MembershipType, User } from "@/models";
import ApiError from "@/utils/apiError";
import ApiResponse from "@/utils/apiResponse";

const updateStatusByAdmin = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { status, remarks } = req.body;

  // Find payment
  const payment = await Payment.findByPk(paymentId, {
    include: [
      {
        model: MembershipType,
        attributes: ["id", "name", "slug", "price"],
      },
      {
        model: User,
        attributes: ["id", "username", "email", "fullName"],
      },
    ],
  });

  if (!payment) {
    throw new ApiError({
      status: 404,
      message: "Payment not found",
    });
  }

  // Update payment status
  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (remarks !== undefined) updateData.remarks = remarks;

  await payment.update(updateData);

  // Fetch updated payment
  const updatedPayment = await Payment.findByPk(paymentId, {
    include: [
      {
        model: MembershipType,
        attributes: [
          "id",
          "name",
          "slug",
          "description",
          "price",
          "limit",
          "features",
        ],
      },
      {
        model: User,
        attributes: ["id", "username", "email", "fullName", "role"],
      },
    ],
    attributes: [
      "id",
      "userId",
      "membershipTypeId",
      "amount",
      "paymentDate",
      "expiryDate",
      "transactionId",
      "status",
      "paymentMethod",
      "remarks",
      "createdAt",
      "updatedAt",
    ],
  });

  new ApiResponse({
    status: 200,
    message: "Payment status updated successfully",
    data: updatedPayment,
  }).send(res);
};

export default updateStatusByAdmin;

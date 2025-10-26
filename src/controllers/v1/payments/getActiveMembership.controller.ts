import { Request, Response } from "express";
import { Payment, MembershipType } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { PaymentStatus } from "@/enums";

const getActiveMembership = async (req: Request, res: Response) => {
  const user = req.user!;

  // Find the most recent active payment
  const activePayment = await Payment.findOne({
    where: {
      userId: user.id,
      status: PaymentStatus.COMPLETED,
    },
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
    ],
    order: [["expiryDate", "DESC"]],
  });

  if (!activePayment) {
    new ApiResponse({
      status: 200,
      message: "No active membership found",
      data: null,
    }).send(res);
    return;
  }

  // Check if membership is expired
  const isExpired = new Date() > new Date(activePayment.expiryDate);

  new ApiResponse({
    status: 200,
    message: "Active membership fetched successfully",
    data: {
      ...activePayment.toJSON(),
      isExpired,
      daysRemaining: isExpired
        ? 0
        : Math.ceil(
            (new Date(activePayment.expiryDate).getTime() -
              new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          ),
    },
  }).send(res);
};

export default getActiveMembership;

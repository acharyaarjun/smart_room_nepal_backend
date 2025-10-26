import { Request, Response } from "express";
import { Payment } from "@/models";
import { PaymentStatus } from "@/enums";
import { verifyKhaltiPayment } from "@/utils/khaltiUtil";
import env from "@/utils/validateEnv";

const verifyKhalti = async (req: Request, res: Response) => {
  const { pidx } = req.query;

  if (!pidx) {
    res.redirect(`${env.CLIENT_URL}/payment-failed`);
    return;
  }

  const payment = await Payment.findOne({
    where: {
      transactionId: pidx as string,
    },
  });

  if (!payment) {
    res.redirect(`${env.CLIENT_URL}/payment-failed`);
    return;
  }

  try {
    const paymentDetail = await verifyKhaltiPayment(pidx as string);

    if (paymentDetail.status === "Completed") {
      // Update payment status to completed
      await payment.update({
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
        remarks: `Payment verified successfully. Transaction ID: ${
          paymentDetail.transaction_id || pidx
        }`,
      });

      // Redirect to success page with payment details
      res.redirect(
        `${env.CLIENT_URL}/payment-success?transactionId=${pidx}&membershipTypeId=${payment.membershipTypeId}`
      );
      return;
    } else {
      // Update payment status to failed
      await payment.update({
        status: PaymentStatus.FAILED,
        remarks: `Payment verification failed. Status: ${paymentDetail.status}`,
      });

      res.redirect(
        `${env.CLIENT_URL}/payment-failed?reason=${paymentDetail.status}`
      );
      return;
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);

    // Update payment status to failed
    await payment.update({
      status: PaymentStatus.FAILED,
      remarks: `Payment verification error: ${error.message}`,
    });

    res.redirect(`${env.CLIENT_URL}/payment-failed?reason=verification-error`);
    return;
  }
};

export default verifyKhalti;

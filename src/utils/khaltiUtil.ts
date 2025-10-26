import axios from "axios";
import { MembershipType, User } from "@/models";
import env from "@/utils/validateEnv";

export const createKhaltiPaymentURL = async (
  membershipType: MembershipType,
  user: User,
  returnUrl?: string
) => {
  const amountToPay = membershipType.price;

  const payload = {
    return_url:
      returnUrl || `${env.APP_URL}/api/v1/membership/payment/verify/khalti`,
    website_url: env.APP_URL,
    amount: amountToPay * 100, // Convert to paisa (Khalti uses paisa)
    purchase_order_id: `membership_${membershipType.id}_${
      user.id
    }_${Date.now()}`,
    purchase_order_name: `${membershipType.name} Membership`,
    customer_info: {
      name: user.fullName || user.username,
      email: user.email,
    },
    product_details: [
      {
        identity: membershipType.id.toString(),
        name: membershipType.name,
        total_price: amountToPay * 100,
        quantity: 1,
        unit_price: amountToPay * 100,
      },
    ],
  };

  const response = await axios.post(
    "https://khalti.com/api/v2/epayment/initiate/",
    payload,
    {
      headers: {
        Authorization: `key ${env.KHALTI_SECRET_KEY}`,
      },
    }
  );

  return response.data;
};

export const verifyKhaltiPayment = async (pidx: string) => {
  const response = await axios.post(
    `https://khalti.com/api/v2/epayment/lookup/`,
    {
      pidx,
    },
    {
      headers: {
        Authorization: `key ${env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

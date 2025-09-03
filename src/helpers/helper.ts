import env from "@/utils/validateEnv";
export const getDateAfterMinutes = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60000); // 60000 ms = 1 minute
};

export const generateOTP = (length: number): string => {
  if (!env.isProd) return "123456";

  // alpha numeric characters
  const chars = "0123456789";
  let OTP = "";

  // generating a random OTP of given length
  for (let i = 0; i < length; i++) {
    OTP += chars[Math.floor(Math.random() * 10)];
  }

  return OTP;
};

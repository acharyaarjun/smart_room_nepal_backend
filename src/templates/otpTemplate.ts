import { htmlTemplateCompiler } from "@/templates";

interface OTPTemplateOptions {
  greetings?: string;
  logoLink?: string;
  title?: string;
  otp: string;
  description?: string;
  thanks?: string;
  supportEmail?: string;
}

// set default values for the options
const otpTemplate = ({
  greetings = "Hello",
  logoLink = "http://localhost:3000/logo.png",
  title = "Please use the One Time Password (OTP) provided below:",
  otp = "",
  description = "Note: The above OTP will expire in next ten minutes. Once expired, you have to regenerate another otp.",
  thanks = process.env.EMAIL_FROM_NAME,
  supportEmail = process.env.SUPPORT_EMAIL,
}: OTPTemplateOptions) => {
  return htmlTemplateCompiler({
    templateName: "otp",
    data: {
      greetings,
      logoLink,
      title,
      otp,
      description,
      thanks,
      supportEmail,
    },
  });
};

export default otpTemplate;

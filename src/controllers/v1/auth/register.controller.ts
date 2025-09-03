import { Request, Response } from "express";
import { logger } from "@/logger";
import ApiResponse from "@/utils/apiResponse";
import { EmailVerification, User } from "@/models";
import { otpTemplate } from "@/templates";
import { getDateAfterMinutes } from "@/helpers/helper";
import { hashPassword } from "@/utils/passwordUtil";
import { Role } from "@/enums";

const register = async (req: Request, res: Response): Promise<void> => {
  // get request body
  const {
    email,
    password,
    fullName,
  }: {
    email: string;
    password: string;
    fullName: string;
  } = req.body;

  // generate auto username from email
  let username = email.split("@")[0];

  // check if username exists
  const isUsernameExists = await User.findOne({
    where: {
      username,
    },
  });

  // if username exists, generate a new username
  if (isUsernameExists) {
    const usersCount = await User.count({});

    username = `${username}${usersCount + 1}`;
  }

  // create new user
  const user = await User.build({
    fullName,
    email,
    username,
    password,
    isEmailVerified: false,
    isEnabled: false,
    role: Role.USER,
  }).save();

  // generate otp
  //   const otp = generateOTP(6);
  const otp = "123456"; // For testing purposes, use a static OTP

  // hash otp
  const hashedOtp = await hashPassword(otp);

  // save email verification
  await EmailVerification.build({
    userId: user.id,
    otp: hashedOtp,
    attempts: 0,
    expiresAt: getDateAfterMinutes(5),
  }).save();

  // send email verification email
  try {
    const emailContent: string = otpTemplate({
      greetings: `Dear ${fullName.split(" ")[0]},`,
      title:
        "Please use the One Time Password (OTP) provided below to verify your email address:",
      otp: otp,
      description:
        "Note: The above OTP will expire in next five minutes. Once expired, you have to regenerate another otp.",
    });

    // send email to user
    console.log(emailContent);
  } catch (error) {
    logger.error(error);
  }

  // send response
  new ApiResponse({
    message: "User registered successfully",
    status: 201,
  }).send(res);
};

export default register;

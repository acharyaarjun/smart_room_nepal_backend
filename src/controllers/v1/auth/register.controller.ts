import { Request, Response } from "express";
import { logger } from "@/logger";
import ApiResponse from "@/utils/apiResponse";
import { EmailVerification, Media, User, UserProfile } from "@/models";
import { otpTemplate } from "@/templates";
import { getDateAfterMinutes } from "@/helpers/helper";
import { hashPassword } from "@/utils/passwordUtil";
import {
  FileStorageDirectory,
  Gender,
  MaritalStatus,
  OccupationStatus,
  Role,
  UserStatus,
} from "@/enums";
import ApiError from "@/utils/apiError";
import { createMedia } from "@/controllers/v1/media";

const register = async (req: Request, res: Response): Promise<void> => {
  // get request body
  const {
    email,
    password,
    fullName,
    gender,
    dob,
    phone,
    occupationStatus,
    maritalStatus,
    role,
  }: {
    email: string;
    password: string;
    fullName: string;
    gender: Gender;
    dob: Date;
    phone: string;
    occupationStatus: OccupationStatus;
    maritalStatus: MaritalStatus;
    role: Role;
  } = req.body;

  const file = req.file;

  if (!file && role === Role.HOST) {
    throw new ApiError({
      status: 400,
      message: "Document is required",
      errors: [
        {
          document: "Document is required",
        },
      ],
    });
  }

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
  const user = await User.create({
    fullName,
    email,
    username,
    password,
    isEmailVerified: true,
    isEnabled: true,
    role: role || Role.USER,
  });

  let media: Media | null = null;
  if (file) {
    media = await createMedia({
      user,
      file,
      directory: FileStorageDirectory.DOCUMENTS,
    });
  }
  await UserProfile.create({
    userId: user.id,
    phone,
    isPhoneVerified: false,
    gender,
    dob,
    occupationStatus,
    maritalStatus,
    documentId: file ? media?.id : undefined,
    status: user.role === Role.HOST ? UserStatus.PENDING : UserStatus.ACTIVE,
  });

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

import bcrypt from "bcrypt";
import PasswordValidator from "password-validator";
import { logger } from "@/logger";

// The number of salt rounds to use
const saltRounds: number = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, encrypted) => {
      if (err) {
        logger.error(err);
        reject(err);
      }
      resolve(encrypted);
    });
  });
};

export const comparePassword = async ({
  password,
  encryptedPassword,
}: {
  password: string;
  encryptedPassword: string;
}): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, same) => {
      if (err) {
        logger.error(err);
        reject(err);
      }
      resolve(same);
    });
  });
};

export const validatePassword = (password: string): boolean => {
  const schema = new PasswordValidator();

  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces(); // Should not have spaces

  return schema.validate(password) as boolean;
};

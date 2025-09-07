import mime from "mime-types";
import env from "@/utils/validateEnv";
import sanitizeHtml from "sanitize-html";
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

export const detectMimeType = (fileName: string): string => {
  return mime.lookup(fileName) || "application/octet-stream";
};

export const stripHtml = (str: string, length?: string | number): string => {
  if (!str) return "";

  // Remove all HTML tags and attributes
  const text = sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (typeof length === "string") {
    length = parseInt(length, 10);
  }

  // Truncate if length is specified
  return text.slice(0, length || 100);
};

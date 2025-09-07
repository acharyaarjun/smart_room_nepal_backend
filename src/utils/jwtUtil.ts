import { Request } from "express";
import { sign, verify } from "jsonwebtoken";
import env from "./validateEnv";
import fs from "fs";
import path from "path";
import { rootDir } from "./fileStorageUtil";
import { logger } from "@/logger";

const privateKeyPath = path.join(rootDir, "/jwt-private-key.pem");
const publicKeyPath = path.join(rootDir, "/jwt-public-key.pem");

const getPrivateKey = (): string => {
  try {
    return fs.readFileSync(privateKeyPath, "utf8");
  } catch (error) {
    logger.error("Error reading private key file", error);
    return env.JWT_PRIVATE_KEY;
  }
};

const getPublicKey = (): string => {
  try {
    return fs.readFileSync(publicKeyPath, "utf8");
  } catch (error) {
    logger.error("Error reading public key file", error);
    return env.JWT_PUBLIC_KEY;
  }
};

export const generateToken = ({
  payload,
  expiresIn,
}: {
  payload: any;
  expiresIn: number; // in minutes
}): string => {
  return sign(payload, getPrivateKey(), {
    expiresIn: expiresIn * 60,
    issuer: env.JWT_ISSUER,
    algorithm: "RS512",
  });
};

export const verifyToken = ({
  token,
  ignoreExpiration = false,
}: {
  token: string;
  ignoreExpiration?: boolean;
}): any => {
  return verify(token, getPublicKey(), {
    issuer: env.JWT_ISSUER,
    algorithms: ["RS512"],
    ignoreExpiration: ignoreExpiration || false,
  });
};

export const removeBearer = ({ token }: { token: string }): string => {
  if (token.startsWith("Bearer ")) {
    return token.slice(7, token.length);
  }

  return token;
};

export const getAuthToken = ({ req }: { req: Request }): string | null => {
  const authorization = req.headers.authorization;

  if (
    authorization &&
    typeof authorization === "string" &&
    authorization.split(" ")[0] === "Bearer"
  ) {
    return removeBearer({ token: authorization });
  }

  return null;
};

export const getCookieToken = ({
  req,
  isRefreshToken = false,
}: {
  req: Request;
  isRefreshToken?: boolean;
}): string | null => {
  const cookieName = isRefreshToken ? "refreshToken" : "accessToken";

  if (req.cookies && req.cookies[cookieName]) {
    return removeBearer({ token: req.cookies[cookieName] });
  }

  return null;
};

export const generateRefreshToken = ({
  userId,
}: {
  userId: string;
}): string => {
  return generateToken({
    payload: {
      id: userId,
    },
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const generateAccessToken = ({
  userId,
  role,
  refreshTokenId,
}: {
  userId: string;
  role: string;
  refreshTokenId: string;
}): string => {
  return generateToken({
    payload: {
      id: userId,
      role: role,
      rfId: refreshTokenId,
    },
    // expiresIn: env.JWT_EXPIRES_IN,
    expiresIn: 86400,
  });
};

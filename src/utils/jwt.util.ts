import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../constants/enums";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export const signAccessToken = (userId: string, role: UserRole): string =>
  jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenPayload;

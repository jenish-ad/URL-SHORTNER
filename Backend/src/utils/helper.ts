import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

import { UnauthorizedError } from "./errorHandler.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured.");
  }
  return secret;
}

export const generateNanoId = (length = 7): string => nanoid(length);

export const signToken = (payload: { id: string }): string =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "1h", algorithm: "HS256" });

export function verifyToken(token: string): string {
  const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  if (typeof decoded === "string" || typeof decoded.id !== "string") {
    throw new UnauthorizedError();
  }
  return decoded.id;
}

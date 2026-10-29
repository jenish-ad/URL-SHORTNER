import type { CookieOptions } from "express";

import type { UserDocument } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  get secure() {
    return process.env.NODE_ENV === "production";
  },
  sameSite: "lax",
  maxAge: 60 * 60 * 1000,
};

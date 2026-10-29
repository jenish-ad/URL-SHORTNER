import type { RequestHandler } from "express";

import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "./helper.js";

export const attachUser: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.accessToken;
  if (typeof token !== "string") {
    next();
    return;
  }
  let id: string;
  try {
    id = verifyToken(token);
  } catch {
    next();
    return;
  }
  try {
    const user = await findUserById(id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

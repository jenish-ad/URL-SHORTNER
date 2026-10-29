import type { RequestHandler } from "express";

import { UnauthorizedError } from "../utils/errorHandler.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }
  next();
};

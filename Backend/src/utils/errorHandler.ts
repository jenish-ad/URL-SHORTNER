import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Invalid request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({ success: false, message: "Resource already exists" });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof SyntaxError) {
    res.status(400).json({ success: false, message: "Invalid request data" });
    return;
  }
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
};

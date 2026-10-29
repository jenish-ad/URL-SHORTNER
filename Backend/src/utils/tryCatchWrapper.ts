import type { NextFunction, Request, RequestHandler, Response } from "express";

type ApiRequest = Request<Request["params"], unknown, Record<string, unknown>>;

type AsyncHandler = (
  req: ApiRequest,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export default function wrapAsync(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

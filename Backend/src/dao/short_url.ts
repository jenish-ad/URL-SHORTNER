import { mongo, type Types } from "mongoose";

import UrlModel from "../models/short_url.model.js";
import { ConflictError } from "../utils/errorHandler.js";

export async function saveShortUrl(
  shortUrl: string,
  longUrl: string,
  userId?: Types.ObjectId,
): Promise<void> {
  try {
    await UrlModel.create({ full_url: longUrl, short_url: shortUrl, user: userId });
  } catch (error) {
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      throw new ConflictError("Short URL already exists");
    }
    throw error;
  }
}

export const getShortUrl = (shortUrl: string) =>
  UrlModel.findOneAndUpdate(
    { short_url: shortUrl },
    { $inc: { clicks: 1 } },
    { new: true },
  );

export const getCustomShortUrl = (slug: string) =>
  UrlModel.findOne({ short_url: slug });

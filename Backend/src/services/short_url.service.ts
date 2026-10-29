import type { Types } from "mongoose";

import { saveShortUrl } from "../dao/short_url.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { generateNanoId } from "../utils/helper.js";

function validateUrl(value: unknown): string {
  if (typeof value !== "string") {
    throw new BadRequestError("URL is required.");
  }
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error();
    }
    return parsed.href;
  } catch {
    throw new BadRequestError("Provide a valid HTTP or HTTPS URL.");
  }
}

function validateSlug(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (
    typeof value !== "string" ||
    !/^[a-zA-Z0-9_-]{3,64}$/.test(value) ||
    value === "health"
  ) {
    throw new BadRequestError(
      "Custom slugs must contain 3–64 letters, numbers, underscores, or hyphens.",
    );
  }
  return value;
}

export async function createShortUrlWithoutUser(url: unknown): Promise<string> {
  const longUrl = validateUrl(url);
  const shortUrl = generateNanoId();
  await saveShortUrl(shortUrl, longUrl);
  return shortUrl;
}

export async function createShortUrlWithUser(
  url: unknown,
  userId: Types.ObjectId,
  slug?: unknown,
): Promise<string> {
  const longUrl = validateUrl(url);
  const shortUrl = validateSlug(slug) ?? generateNanoId();
  await saveShortUrl(shortUrl, longUrl, userId);
  return shortUrl;
}

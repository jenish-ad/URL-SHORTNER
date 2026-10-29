import { getShortUrl } from "../dao/short_url.js";
import {
  createShortUrlWithoutUser,
  createShortUrlWithUser,
} from "../services/short_url.service.js";
import { NotFoundError } from "../utils/errorHandler.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const createShortUrl = wrapAsync(async (req, res) => {
  const { url, slug } = req.body ?? {};
  const shortUrl = req.user
    ? await createShortUrlWithUser(url, req.user._id, slug)
    : await createShortUrlWithoutUser(url);
  res.json({
    shortUrl: new URL(shortUrl, process.env.APP_URL ?? "http://localhost:3000/").href,
  });
});

export const redirectFromShortUrl = wrapAsync(async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new NotFoundError("Short URL not found");
  }
  const url = await getShortUrl(id);
  if (!url) {
    throw new NotFoundError("Short URL not found");
  }
  res.redirect(url.full_url);
});

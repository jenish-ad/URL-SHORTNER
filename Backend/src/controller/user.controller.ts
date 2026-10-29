import { getAllUserUrlsDao } from "../dao/user.dao.js";
import { UnauthorizedError } from "../utils/errorHandler.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const getAllUserUrls = wrapAsync(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const urls = await getAllUserUrlsDao(req.user._id);
  res.json({ message: "success", urls });
});

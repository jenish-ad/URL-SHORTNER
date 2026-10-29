import type { Types } from "mongoose";

import UrlModel from "../models/short_url.model.js";
import User from "../models/user.model.js";

export const findUserByEmail = (email: string) => User.findOne({ email });

export const findUserWithPassword = (email: string) =>
  User.findOne({ email }).select("+password");

export const findUserById = (id: string) => User.findById(id);

export const createUser = (name: string, email: string, password: string) =>
  User.create({ name, email, password });

export const getAllUserUrlsDao = (id: Types.ObjectId) =>
  UrlModel.find({ user: id }).sort({ _id: -1 });

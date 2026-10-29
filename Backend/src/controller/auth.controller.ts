import { cookieOptions } from "../config/config.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const registerUserController = wrapAsync(async (req, res) => {
  const { name, email, password } = req.body ?? {};
  const { token, user } = await registerUser(name, email, password);
  res.cookie("accessToken", token, cookieOptions);
  res.status(201).json({ user, message: "Registration successful" });
});

export const loginUserController = wrapAsync(async (req, res) => {
  const { email, password } = req.body ?? {};
  const { token, user } = await loginUser(email, password);
  res.cookie("accessToken", token, cookieOptions);
  res.json({ user, message: "Login successful" });
});

export const logoutUserController = wrapAsync(async (_req, res) => {
  const { maxAge: _maxAge, ...options } = cookieOptions;
  res.clearCookie("accessToken", options);
  res.json({ message: "Logout successful" });
});

export const getCurrentUserController = wrapAsync(async (req, res) => {
  res.json({ user: req.user });
});

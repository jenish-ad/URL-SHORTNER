import { Router } from "express";

import {
  getCurrentUserController,
  loginUserController,
  logoutUserController,
  registerUserController,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/logout", logoutUserController);
router.get("/me", authMiddleware, getCurrentUserController);

export default router;

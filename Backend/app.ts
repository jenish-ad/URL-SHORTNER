import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import connectDB from "./src/config/monogo.config.js";
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import authRoutes from "./src/routes/auth.routes.js";
import shortUrlRoutes from "./src/routes/short_url.route.js";
import userRoutes from "./src/routes/user.routes.js";
import { attachUser } from "./src/utils/attachUser.js";
import { errorHandler, NotFoundError } from "./src/utils/errorHandler.js";

const directory = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(directory, directory.endsWith("dist") ? "../.env" : ".env"),
});

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});
app.use(attachUser);

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/create", shortUrlRoutes);
app.get("/:id", redirectFromShortUrl);

app.use((_req, _res, next) => next(new NotFoundError()));
app.use(errorHandler);

export async function startServer(): Promise<void> {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Set JWT_SECRET in Backend/.env before starting the server.");
    }
    await connectDB();
    const port = Number(process.env.PORT ?? 3000);
    const server = app.listen(port, () => {
      console.info(`Server is running on http://localhost:${port}`);
    });
    const shutdown = () => {
      server.close(() => {
        void mongoose.disconnect().then(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Server startup failed");
    process.exitCode = 1;
  }
}

if (process.env.NODE_ENV !== "test") {
  await startServer();
}

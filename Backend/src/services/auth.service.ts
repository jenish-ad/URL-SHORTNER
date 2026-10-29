import { createUser, findUserByEmail, findUserWithPassword } from "../dao/user.dao.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/errorHandler.js";
import { signToken } from "../utils/helper.js";

function validateCredentials(
  email: unknown,
  password: unknown,
): { email: string; password: string } {
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    throw new BadRequestError(
      "Provide a valid email and a password of at least 6 characters.",
    );
  }
  return { email: email.trim().toLowerCase(), password };
}

export async function registerUser(name: unknown, email: unknown, password: unknown) {
  const input = validateCredentials(email, password);
  if (typeof name !== "string" || !name.trim()) {
    throw new BadRequestError("Name is required.");
  }
  if (await findUserByEmail(input.email)) {
    throw new ConflictError("User already exists");
  }
  const user = await createUser(name.trim(), input.email, input.password);
  return { token: signToken({ id: user._id.toString() }), user };
}

export async function loginUser(email: unknown, password: unknown) {
  const input = validateCredentials(email, password);
  const user = await findUserWithPassword(input.email);
  if (!user || !(await user.comparePassword(input.password))) {
    throw new UnauthorizedError("Invalid email or password");
  }
  return { token: signToken({ id: user._id.toString() }), user };
}

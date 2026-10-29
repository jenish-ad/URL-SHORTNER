import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

process.env.NODE_ENV = "test";

process.env.JWT_SECRET = randomUUID();

const { app } = await import("./app.js");

const databaseName = `url-shortner-test-${randomUUID()}`;

let server: Server;

let baseUrl: string;

before(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI ?? "mongodb://127.0.0.1:27017", {
    dbName: databaseName,
    serverSelectionTimeoutMS: 5000,
  });
  await mongoose.connection.syncIndexes();
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
  if (mongoose.connection.db?.databaseName === databaseName) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});

async function request(
  path: string,
  body?: unknown,
  cookie?: string,
): Promise<Response> {
  return fetch(baseUrl + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    redirect: "manual",
  });
}

test("rejects invalid input and protects private endpoints", async () => {
  assert.equal(
    (await request("/api/create", { url: "javascript:alert(1)" })).status,
    400,
  );
  assert.equal((await request("/api/create", {})).status, 400);
  assert.equal(
    (
      await request("/api/auth/register", {
        name: "Test",
        email: {},
        password: "secret123",
      })
    ).status,
    400,
  );
  assert.equal((await request("/api/user/urls", {})).status, 401);
  assert.equal((await request("/api/auth/me")).status, 401);
  assert.equal((await request("/missing-short-link")).status, 404);
  assert.equal((await request("/health")).status, 200);
});

test("creates anonymous links and redirects to their original URL", async () => {
  const response = await request("/api/create", {
    url: "https://example.com/anonymous",
  });
  assert.equal(response.status, 200);
  const data = (await response.json()) as { shortUrl: string };
  const redirected = await request(new URL(data.shortUrl).pathname);
  assert.equal(redirected.status, 302);
  assert.equal(redirected.headers.get("location"), "https://example.com/anonymous");
});

test("registration, login, custom links, click counts, and logout work together", async () => {
  const account = {
    name: "Integration Test",
    email: "integration@example.com",
    password: "secret123",
  };
  const registration = await request("/api/auth/register", account);
  assert.equal(registration.status, 201);
  const registered = (await registration.json()) as {
    user: { _id: string; password?: string };
  };
  assert(registered.user._id);
  assert.equal(registered.user.password, undefined);
  assert.equal((await request("/api/auth/register", account)).status, 409);
  assert.equal(
    (await request("/api/auth/login", { ...account, password: "wrong-password" }))
      .status,
    401,
  );
  const login = await request("/api/auth/login", account);
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert(cookie);
  assert.equal((await request("/api/auth/me", undefined, cookie)).status, 200);
  const body = { url: "https://example.com/custom", slug: "test-custom-link" };
  assert.equal((await request("/api/create", body, cookie)).status, 200);
  assert.equal((await request("/api/create", body, cookie)).status, 409);
  assert.equal(
    (await request("/api/create", { ...body, slug: "health" }, cookie)).status,
    400,
  );
  assert.equal((await request("/test-custom-link")).status, 302);
  const urls = await request("/api/user/urls", {}, cookie);
  const data = (await urls.json()) as { urls: { clicks: number; short_url: string }[] };
  assert.equal(data.urls.length, 1);
  assert.equal(data.urls[0]?.short_url, "test-custom-link");
  assert.equal(data.urls[0]?.clicks, 1);
  const logout = await request("/api/auth/logout", {}, cookie);
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie") ?? "", /accessToken=;/);
});

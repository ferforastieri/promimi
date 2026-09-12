import assert from "node:assert/strict";
import test from "node:test";
import { clearSession, establishSession } from "./session.js";

test("browser sessions are HttpOnly, SameSite and secure outside development", () => {
  const cookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];
  const reply = {
    setCookie: (
      name: string,
      value: string,
      options: Record<string, unknown>,
    ) => cookies.push({ name, value, options }),
  };
  const app = {
    jwt: { sign: () => "signed-session" },
    promimiConfig: { NODE_ENV: "production" },
  };
  establishSession(app as never, reply as never, {
    id: "user-id",
    role: "VISITOR",
    email: "visitor@example.test",
  });
  assert.equal(cookies[0]?.name, "promimi_session");
  assert.equal(cookies[0]?.value, "signed-session");
  assert.equal(cookies[0]?.options.httpOnly, true);
  assert.equal(cookies[0]?.options.secure, true);
  assert.equal(cookies[0]?.options.sameSite, "lax");
});

test("clearing a session preserves its security attributes", () => {
  const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
  const reply = {
    clearCookie: (name: string, options: Record<string, unknown>) =>
      cleared.push({ name, options }),
  };
  clearSession(
    { promimiConfig: { NODE_ENV: "production" } } as never,
    reply as never,
  );
  assert.equal(cleared[0]?.name, "promimi_session");
  assert.equal(cleared[0]?.options.httpOnly, true);
  assert.equal(cleared[0]?.options.sameSite, "lax");
});

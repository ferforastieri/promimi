import assert from "node:assert/strict";
import test from "node:test";
import { clearSession, establishSession } from "./session.js";

test("browser sessions are HttpOnly, SameSite and secure outside development", () => {
  const previous = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const reply = { setCookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }) };
  const app = { jwt: { sign: () => "signed-session" } };
  establishSession(app as never, reply as never, { id: "user-id", role: "VISITOR", email: "visitor@example.test" });
  assert.equal(cookies[0]?.name, "promimi_session");
  assert.equal(cookies[0]?.value, "signed-session");
  assert.equal(cookies[0]?.options.httpOnly, true);
  assert.equal(cookies[0]?.options.secure, true);
  assert.equal(cookies[0]?.options.sameSite, "lax");
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
});

test("clearing a session preserves its security attributes", () => {
  const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
  const reply = { clearCookie: (name: string, options: Record<string, unknown>) => cleared.push({ name, options }) };
  clearSession(reply as never);
  assert.equal(cleared[0]?.name, "promimi_session");
  assert.equal(cleared[0]?.options.httpOnly, true);
  assert.equal(cleared[0]?.options.sameSite, "lax");
});

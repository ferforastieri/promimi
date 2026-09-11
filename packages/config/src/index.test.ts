import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "./index.js";

const valid = {
  DATABASE_URL: "postgresql://promimi:secret@localhost:5432/promimi",
  APP_URL: "http://localhost:3000",
  API_URL: "http://localhost:3001",
  JWT_SECRET: "j".repeat(32),
  INTEGRATION_ENCRYPTION_KEY: "k".repeat(32)
};

test("accepts a complete runtime configuration", () => {
  assert.equal(loadConfig(valid).PORT, 3001);
});

test("rejects insecure application secrets", () => {
  assert.throws(() => loadConfig({ ...valid, JWT_SECRET: "short" }));
});

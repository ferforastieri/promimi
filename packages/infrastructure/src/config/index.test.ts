import assert from "node:assert/strict";
import test from "node:test";
import { loadApiConfig } from "./api.js";

const valid = {
  DATABASE_URL: "postgresql://promimi:secret@localhost:5432/promimi",
  APP_URL: "http://localhost:3000",
  API_URL: "http://localhost:3001",
  JWT_SECRET: "j".repeat(32),
  INTEGRATION_ENCRYPTION_KEY: "k".repeat(32),
};

test("accepts a complete runtime configuration", () => {
  assert.equal(loadApiConfig(valid).PORT, 3001);
});

test("accepts explicitly configured browser origins", () => {
  assert.deepEqual(
    loadApiConfig({
      ...valid,
      CORS_ALLOWED_ORIGINS: "http://192.168.15.10:5173",
    }).CORS_ALLOWED_ORIGINS,
    ["http://192.168.15.10:5173"],
  );
});

test("rejects insecure application secrets", () => {
  assert.throws(() => loadApiConfig({ ...valid, JWT_SECRET: "short" }));
});

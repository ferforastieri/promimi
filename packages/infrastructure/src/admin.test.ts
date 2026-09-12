import assert from "node:assert/strict";
import test from "node:test";
import { loadAdminConfig } from "./admin.js";

test("loads explicit preview hosts", () => {
  assert.deepEqual(loadAdminConfig({ ADMIN_PREVIEW_ALLOWED_HOSTS: "admin.example.com, admin.internal" }).ADMIN_PREVIEW_ALLOWED_HOSTS, ["admin.example.com", "admin.internal"]);
});

test("rejects a preview host with a protocol or port", () => {
  assert.throws(() => loadAdminConfig({ ADMIN_PREVIEW_ALLOWED_HOSTS: "https://admin.example.com:4173" }));
});

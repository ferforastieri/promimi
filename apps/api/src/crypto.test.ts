import test from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret, hashToken } from "./crypto.js";

test("encrypts credentials without preserving plaintext", () => {
  const encrypted = encryptSecret({ token: "do-not-log" }, "a-very-long-secret-that-is-safe-for-a-test");
  assert.equal(encrypted.includes("do-not-log"), false);
  assert.deepEqual(decryptSecret(encrypted, "a-very-long-secret-that-is-safe-for-a-test"), { token: "do-not-log" });
  assert.throws(() => decryptSecret(encrypted, "another-long-secret-that-is-safe-for-tests"));
});
test("hashes opaque authentication tokens", () => assert.equal(hashToken("value").length, 64));

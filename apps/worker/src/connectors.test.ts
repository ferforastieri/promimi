import assert from "node:assert/strict";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import test from "node:test";
import { deliver } from "./connectors.js";

const offer = {
  id: "1",
  slug: "fone",
  title: "Fone",
  currentPrice: "99.90",
  originalPrice: null,
  discountPercent: null,
  couponCode: null,
  affiliateUrl: "https://example.test/fone",
  store: { name: "Loja" },
};
const config = {
  INTEGRATION_ENCRYPTION_KEY: "worker-test-key",
  API_URL: "http://localhost:3001",
  PUBLIC_API_URL: undefined,
};

function encryptedCredentials(value: Record<string, string>) {
  const key = createHash("sha256").update("worker-test-key").digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${payload.toString("base64url")}`;
}

test("pauses WhatsApp publishing when the isolated bridge is disconnected", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "WhatsApp não está conectado" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  try {
    const result = await deliver(
      "whatsapp",
      offer,
      {
        provider: "whatsapp",
        enabled: true,
        credentialsEncrypted: encryptedCredentials({
          bridgeUrl: "http://bridge.test",
          destination: "120000000@g.us",
        }),
        settings: {},
      },
      config,
    );
    assert.equal(result.status, "PAUSED");
    assert.match(result.error ?? "", /desconectado/i);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("sends deterministic Telegram and Meta payloads with encrypted credentials", async () => {
  const previousFetch = globalThis.fetch;
  const calls: Array<{
    url: string;
    body: Record<string, unknown>;
    authorization?: string | null;
  }> = [];
  globalThis.fetch = async (url, init) => {
    calls.push({
      url: String(url),
      body: JSON.parse(String(init?.body)),
      authorization: new Headers(init?.headers).get("authorization"),
    });
    return new Response(
      JSON.stringify({ result: { message_id: 44 }, id: "meta-publication" }),
      { headers: { "content-type": "application/json" } },
    );
  };
  try {
    const telegram = await deliver(
      "telegram",
      offer,
      {
        provider: "telegram",
        enabled: true,
        credentialsEncrypted: encryptedCredentials({
          botToken: "bot-token",
          chatId: "-100123",
        }),
        settings: {},
      },
      config,
    );
    const facebook = await deliver(
      "facebook",
      offer,
      {
        provider: "facebook",
        enabled: true,
        credentialsEncrypted: encryptedCredentials({
          accessToken: "meta-token",
          pageId: "page-123",
        }),
        settings: {},
      },
      config,
    );
    const instagram = await deliver(
      "instagram",
      offer,
      {
        provider: "instagram",
        enabled: true,
        credentialsEncrypted: encryptedCredentials({
          accessToken: "meta-token",
          pageId: "ig-123",
        }),
        settings: {},
      },
      config,
    );
    assert.deepEqual(telegram, { status: "SENT", externalId: "44" });
    assert.deepEqual(facebook, {
      status: "SENT",
      externalId: "meta-publication",
    });
    assert.deepEqual(instagram, {
      status: "SENT",
      externalId: "meta-publication",
    });
    assert.match(
      calls[0].url,
      /api\.telegram\.org\/botbot-token\/sendMessage$/,
    );
    assert.equal(calls[0].body.chat_id, "-100123");
    assert.match(
      String(calls[1].url),
      /graph\.facebook\.com\/v20\.0\/page-123\/feed$/,
    );
    assert.equal(calls[1].authorization, "Bearer meta-token");
    assert.match(calls[2].url, /graph\.facebook\.com\/v20\.0\/ig-123\/media$/);
    assert.equal(
      calls[2].body.image_url,
      "http://localhost:3001/api/v1/offers/fone/card.svg",
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("keeps X disabled until an approved budget is configured", async () => {
  try {
    const result = await deliver(
      "x",
      offer,
      {
        provider: "x",
        enabled: true,
        credentialsEncrypted: encryptedCredentials({ accessToken: "unused" }),
        settings: {},
      },
      config,
    );
    assert.equal(result.status, "PAUSED");
    assert.match(result.error ?? "", /desativado/i);
  } finally {
  }
});

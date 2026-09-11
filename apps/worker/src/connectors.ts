import { createDecipheriv, createHash } from "node:crypto";
import { publicationText, type PublicationOffer } from "./templates.js";

type Credentials = Record<string, string>;
export type DeliveryResult = { externalId?: string; status: "SENT" | "PAUSED"; error?: string };
export type Integration = { provider: string; enabled: boolean; credentialsEncrypted: string | null; settings: unknown };
class DestinationError extends Error { constructor(readonly status: number) { super(`Destino recusou a publicação (${status}).`); } }

function decryptCredentials(payload: string | null): Credentials {
  if (!payload) return {};
  const [ivValue, tagValue, dataValue] = payload.split(".");
  if (!ivValue || !tagValue || !dataValue) throw new Error("Credencial de integração inválida.");
  const key = createHash("sha256").update(process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden").digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(dataValue, "base64url")), decipher.final()]).toString("utf8")) as Credentials;
}
const splitDestinations = (value?: string) => [...new Set((value ?? "").split(",").map((destination) => destination.trim()).filter(Boolean))];

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new DestinationError(response.status);
  return result as Record<string, unknown>;
}

export async function deliver(destination: string, offer: PublicationOffer, integration?: Integration): Promise<DeliveryResult> {
  if (!integration?.enabled) return { status: "PAUSED", error: "Integração desativada no painel." };
  const credentials = decryptCredentials(integration.credentialsEncrypted);
  const text = publicationText(offer, destination);
  if (destination === "telegram") {
    if (!credentials.botToken || !credentials.chatId) return { status: "PAUSED", error: "Configure botToken e chatId do Telegram." };
    const result = await postJson(`https://api.telegram.org/bot${credentials.botToken}/sendMessage`, { chat_id: credentials.chatId, text, disable_web_page_preview: false });
    return { status: "SENT", externalId: String((result.result as { message_id?: string } | undefined)?.message_id ?? "") };
  }
  if (destination === "whatsapp") {
    const bridgeUrl = credentials.bridgeUrl ?? process.env.WHATSAPP_BRIDGE_URL;
    const destinations = splitDestinations(credentials.destinations ?? credentials.destination);
    if (!bridgeUrl || !destinations.length) return { status: "PAUSED", error: "Configure bridgeUrl e ao menos um destino do WhatsApp." };
    try {
      const results = await Promise.all(destinations.map((chatId) => postJson(`${bridgeUrl.replace(/\/$/, "")}/messages`, { destination: chatId, text }, credentials.bridgeToken ? { authorization: `Bearer ${credentials.bridgeToken}` } : {})));
      return { status: "SENT", externalId: results.map((result) => String(result.id ?? "")).filter(Boolean).join(",") };
    } catch (error) {
      if (error instanceof DestinationError && error.status === 503) return { status: "PAUSED", error: "WhatsApp desconectado; reconecte o número dedicado antes de retomar." };
      throw error;
    }
  }
  if (destination === "instagram" || destination === "facebook") {
    if (!credentials.accessToken || !credentials.pageId) return { status: "PAUSED", error: "Configure accessToken e pageId da Meta." };
    const base = "https://graph.facebook.com/v20.0";
    const endpoint = destination === "instagram" ? `${base}/${credentials.pageId}/media` : `${base}/${credentials.pageId}/feed`;
    const generatedCardUrl = `${(process.env.PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3001").replace(/\/$/, "")}/api/v1/offers/${encodeURIComponent(offer.slug)}/card.svg`;
    const result = await postJson(endpoint, destination === "instagram" ? { caption: text, image_url: credentials.imageUrl ?? generatedCardUrl } : { message: text, link: offer.affiliateUrl }, { authorization: `Bearer ${credentials.accessToken}` });
    return { status: "SENT", externalId: String(result.id ?? "") };
  }
  return { status: "PAUSED", error: "Conector X/Twitter permanece desativado até haver teto de gasto aprovado." };
}

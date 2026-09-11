import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db, integrations } from "@promimi/database";
import { z } from "zod";
import { requireStaff } from "../../shared/auth/guards.js";
import { decryptSecret, encryptSecret } from "../../crypto.js";
import { parseDestinations } from "./application/whatsapp-destinations.js";
import { integrationRepository } from "./infrastructure/drizzle-integration-repository.js";

const encryptionKey = () => process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden";

/** Integrations boundary: credentials are encrypted at rest and never returned by HTTP. */
export async function registerIntegrationsHttp(app: FastifyInstance) {
  app.get("/admin/integrations", { preHandler: requireStaff }, async () => ({ data: (await integrationRepository.list()).map(({ credentialsEncrypted: _secret, ...integration }) => integration) }));
  app.put("/admin/integrations/:provider", { preHandler: requireStaff }, async (request, reply) => {
    const { provider } = request.params as { provider: string }; const body = z.object({ enabled: z.boolean(), settings: z.record(z.unknown()).default({}), credentials: z.record(z.string()).optional() }).parse(request.body);
    const existing = await integrationRepository.find(provider); const existingSettings = (existing?.settings && typeof existing.settings === "object" && !Array.isArray(existing.settings) ? existing.settings : {}) as Record<string, unknown>; const settings = { ...existingSettings, ...body.settings };
    const credentials = body.credentials ?? (existing?.credentialsEncrypted ? decryptSecret<Record<string, string>>(existing.credentialsEncrypted, encryptionKey()) : {});
    if (provider === "whatsapp" && body.enabled) { const destinations = parseDestinations(credentials); const validated = Array.isArray(settings.validatedDestinations) ? settings.validatedDestinations.filter((value): value is string => typeof value === "string") : []; if (!destinations.length || !destinations.every((destination) => validated.includes(destination))) return reply.code(400).send({ error: "WHATSAPP_NOT_VALIDATED", message: "Salve os destinos, valide grupos/canais e só então ative o WhatsApp." }); }
    const credentialsEncrypted = body.credentials ? encryptSecret(body.credentials, encryptionKey()) : existing?.credentialsEncrypted ?? null;
    const [integration] = await integrationRepository.save({ provider, enabled: body.enabled, settings, credentialsEncrypted }); const { credentialsEncrypted: _secret, ...safe } = integration; return { data: safe };
  });
  app.post("/admin/integrations/whatsapp/validate", { preHandler: requireStaff }, async (_request, reply) => {
    const integration = await db.query.integrations.findFirst({ where: eq(integrations.provider, "whatsapp") }); if (!integration?.credentialsEncrypted) return reply.code(400).send({ error: "WHATSAPP_NOT_CONFIGURED", message: "Salve o bridge e os destinos do WhatsApp antes de validar." });
    const credentials = decryptSecret<Record<string, string>>(integration.credentialsEncrypted, encryptionKey()); const destinations = [...new Set((credentials.destinations ?? credentials.destination ?? "").split(",").map((value) => value.trim()).filter(Boolean))]; if (!credentials.bridgeUrl || !destinations.length) return reply.code(400).send({ error: "WHATSAPP_NOT_CONFIGURED", message: "Configure bridgeUrl e ao menos um grupo ou canal." });
    let result: { data?: Array<{ destination: string; ok: boolean; name?: string; isGroup?: boolean; message?: string }> };
    try { const response = await fetch(`${credentials.bridgeUrl.replace(/\/$/, "")}/validate-destinations`, { method: "POST", headers: { "content-type": "application/json", ...(credentials.bridgeToken ? { authorization: `Bearer ${credentials.bridgeToken}` } : {}) }, body: JSON.stringify({ destinations }), signal: AbortSignal.timeout(15_000) }); result = await response.json().catch(() => ({})); if (!response.ok) return reply.code(400).send({ error: "WHATSAPP_VALIDATION_FAILED", message: "O bridge não conseguiu validar os destinos. Verifique QR, número e permissões." }); } catch { return reply.code(400).send({ error: "WHATSAPP_VALIDATION_FAILED", message: "Não foi possível alcançar o bridge do WhatsApp." }); }
    const validatedDestinations = (result.data ?? []).filter((item) => item.ok).map((item) => item.destination); const settings = { ...((integration.settings && typeof integration.settings === "object" && !Array.isArray(integration.settings) ? integration.settings : {}) as Record<string, unknown>), validatedDestinations, validatedAt: new Date().toISOString() };
    await db.update(integrations).set({ settings, lastHealthAt: new Date(), updatedAt: new Date() }).where(eq(integrations.id, integration.id)); return { data: result.data ?? [], allValid: destinations.every((destination) => validatedDestinations.includes(destination)) };
  });
}

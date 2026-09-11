import type { FastifyInstance } from "fastify";
import { db } from "@promimi/database";
import { sql } from "drizzle-orm";
import { registerAnalyticsHttp } from "./modules/analytics/http.js";
import { registerAutomationHttp } from "./modules/automation/http.js";
import { registerCatalogHttp } from "./modules/catalog/http.js";
import { registerCommunityHttp } from "./modules/community/http.js";
import { registerIdentityHttp } from "./modules/identity/http.js";
import { registerIntegrationsHttp } from "./modules/integrations/http.js";
import { registerPublishingHttp } from "./modules/publishing/http.js";

/** Composition root for HTTP modules. Domain modules own their routes and persistence adapters. */
export async function routes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    try { await db.execute(sql`select 1`); return { ok: true, now: new Date().toISOString() }; }
    catch { return reply.code(503).send({ ok: false, message: "Banco de dados indisponível." }); }
  });
  await registerIdentityHttp(app);
  await registerCatalogHttp(app);
  await registerCommunityHttp(app);
  await registerIntegrationsHttp(app);
  await registerAutomationHttp(app);
  await registerPublishingHttp(app);
  await registerAnalyticsHttp(app);
}

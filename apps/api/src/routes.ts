import type { FastifyInstance } from "fastify";
import { registerAnalyticsHttp } from "./modules/analytics/http/index.js";
import { registerAutomationHttp } from "./modules/automation/http/index.js";
import { registerCatalogHttp } from "./modules/catalog/http/index.js";
import { registerCommunityHttp } from "./modules/community/http/index.js";
import { registerIdentityHttp } from "./modules/identity/http/index.js";
import { registerIntegrationsHttp } from "./modules/integrations/http/index.js";
import { registerPublishingHttp } from "./modules/publishing/http/index.js";
import { registerHealthEndpoint } from "./shared/observability/health.js";

/** Composition root for HTTP modules. Domain modules own their routes and persistence adapters. */
export async function routes(app: FastifyInstance) {
  registerHealthEndpoint(app);
  await registerIdentityHttp(app);
  await registerCatalogHttp(app);
  await registerCommunityHttp(app);
  await registerIntegrationsHttp(app);
  await registerAutomationHttp(app);
  await registerPublishingHttp(app);
  await registerAnalyticsHttp(app);
}

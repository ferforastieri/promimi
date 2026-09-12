import Fastify from "fastify";
import autoload from "@fastify/autoload";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadApiConfig } from "@promimi/infrastructure/config/api";
import { bootstrapAdmin } from "./modules/identity/infrastructure/bootstrap-admin.js";
import { registerHealthEndpoint } from "./shared/observability/health.js";
import { installMetrics } from "./shared/observability/metrics.js";
import { installCsrfOriginGuard } from "./shared/http/csrf.js";
import { installErrorHandler } from "./shared/http/errors.js";
import { rateLimits } from "./shared/http/rate-limit.js";

const config = loadApiConfig();
const modulesDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "modules",
);
const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 1_048_576 });
app.decorate("promimiConfig", config);
const allowedOrigins = new Set(
  [
    config.APP_URL,
    config.ADMIN_URL,
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter((origin): origin is string => Boolean(origin)),
);
await app.register(helmet, {
  global: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
await app.register(cookie);
await app.register(cors, {
  credentials: true,
  origin: (origin, callback) =>
    callback(null, !origin || allowedOrigins.has(origin)),
});
await app.register(jwt, {
  secret: config.JWT_SECRET,
  cookie: { cookieName: "promimi_session", signed: false },
});
await app.register(rateLimit, rateLimits.default);
installCsrfOriginGuard(app, allowedOrigins);
await app.register(swagger, {
  openapi: {
    info: { title: "Promimi API", version: "v1" },
    servers: [{ url: "/api/v1" }],
  },
});
await app.register(swaggerUi, { routePrefix: "/docs" });
installMetrics(app);
installErrorHandler(app);
registerHealthEndpoint(app);
await app.register(autoload, {
  dir: modulesDirectory,
  dirNameRoutePrefix: false,
  matchFilter: (path) =>
    /[\\/]http[\\/](?:plugin|index)\.(?:[cm]?js|ts)$/.test(path),
  options: { prefix: "/api/v1" },
});
await bootstrapAdmin(config);
await app.listen({ port: config.PORT, host: "0.0.0.0" });

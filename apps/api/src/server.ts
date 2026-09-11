import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { ZodError } from "zod";
import { loadConfig } from "@promimi/config";
import { routes } from "./routes.js";
import { bootstrapAdmin } from "./bootstrap.js";
import { installMetrics } from "./metrics.js";
import "./types.js";

const config = loadConfig();
const app = Fastify({ logger: true, trustProxy: true, bodyLimit: 1_048_576 });
const allowedOrigins = new Set([config.APP_URL, process.env.ADMIN_URL, "http://localhost:3000", "http://localhost:5173"].filter(Boolean));
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
      connectSrc: ["'self'"]
    }
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});
await app.register(cookie);
await app.register(cors, { credentials: true, origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)) });
await app.register(jwt, { secret: config.JWT_SECRET, cookie: { cookieName: "promimi_session", signed: false } });
await app.register(rateLimit, { max: 100, timeWindow: "1 minute", ban: 2 });
app.addHook("onRequest", async (request, reply) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const createsBrowserSession = /^\/api\/v1\/auth\/(login|register)/.test(request.url);
  if (!request.cookies.promimi_session && !createsBrowserSession) return;
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) {
    return reply.code(403).send({ error: "CSRF_REJECTED", message: "Origem da solicitação não permitida." });
  }
});
await app.register(swagger, { openapi: { info: { title: "Promimi API", version: "v1" }, servers: [{ url: "/api/v1" }] } });
await app.register(swaggerUi, { routePrefix: "/docs" });
installMetrics(app);
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) return reply.code(400).send({ error: "VALIDATION_ERROR", message: "Revise os campos informados.", details: error.flatten() });
  const appError = error as { statusCode?: number; message?: string };
  const statusCode = appError.statusCode && appError.statusCode >= 400 ? appError.statusCode : 500;
  if (statusCode >= 500) app.log.error(error);
  return reply.code(statusCode).send({ error: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR", message: statusCode >= 500 ? "Não foi possível concluir esta ação." : appError.message ?? "A solicitação não pôde ser concluída." });
});
await app.register(routes, { prefix: "/api/v1" });
await bootstrapAdmin();
await app.listen({ port: config.PORT, host: "0.0.0.0" });

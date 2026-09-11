import type { FastifyInstance } from "fastify";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";

const register = new Registry();
collectDefaultMetrics({ register, prefix: "promimi_api_" });
const requests = new Counter({ name: "promimi_api_requests_total", help: "HTTP requests processed by the API", labelNames: ["method", "route", "status"] as const, registers: [register] });

export function installMetrics(app: FastifyInstance) {
  app.addHook("onResponse", async (request, reply) => requests.inc({ method: request.method, route: request.routeOptions.url ?? "unmatched", status: String(reply.statusCode) }));
  app.get("/metrics", async (_request, reply) => { reply.header("content-type", register.contentType); return register.metrics(); });
}

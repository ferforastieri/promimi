import type { FastifyInstance } from "fastify";
import { db } from "@promimi/database";
import { sql } from "drizzle-orm";

/** Operational endpoint kept outside domain routes. */
export function registerHealthEndpoint(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    try { await db.execute(sql`select 1`); return { ok: true, now: new Date().toISOString() }; }
    catch { return reply.code(503).send({ ok: false, message: "Banco de dados indisponível." }); }
  });
}

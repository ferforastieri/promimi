import type { FastifyInstance } from "fastify";
import { desc, eq } from "drizzle-orm";
import { db, publications } from "@promimi/database";
import { z } from "zod";
import { requireStaff } from "../../auth.js";

/** Publishing boundary: delivery state. The worker performs connector I/O. */
export async function registerPublishingHttp(app: FastifyInstance) {
  app.get("/admin/publications", { preHandler: requireStaff }, async () => ({ data: await db.query.publications.findMany({ with: { offer: { with: { store: true } } }, orderBy: [desc(publications.createdAt)], limit: 100 }) }));
  app.patch("/admin/publications/:id", { preHandler: requireStaff }, async (request, reply) => { const { id } = request.params as { id: string }; const { status } = z.object({ status: z.enum(["PENDING", "PAUSED"]) }).parse(request.body); const [publication] = await db.update(publications).set({ status, error: status === "PENDING" ? null : undefined, updatedAt: new Date() }).where(eq(publications.id, id)).returning(); if (!publication) return reply.code(404).send({ error: "NOT_FOUND", message: "Publicação não encontrada." }); return { data: publication }; });
}

import type { FastifyInstance } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { comments, db, favorites, reports } from "@promimi/database";
import { z } from "zod";
import { requireUser } from "../../auth.js";

/** Community boundary: favorites, comments and moderation reports. */
export async function registerCommunityHttp(app: FastifyInstance) {
  app.get("/offers/:id/comments", async (request) => {
    const { id } = request.params as { id: string };
    const rows = await db.query.comments.findMany({ where: and(eq(comments.offerId, id), eq(comments.isHidden, false)), with: { user: true }, orderBy: [desc(comments.createdAt)] });
    return { data: rows.map((comment) => ({ id: comment.id, body: comment.body, createdAt: comment.createdAt, author: comment.user.name ?? "Visitante Promimi" })) };
  });
  app.post("/offers/:id/favorite", { preHandler: requireUser }, async (request) => {
    const { id } = request.params as { id: string };
    await db.insert(favorites).values({ userId: request.user.id, offerId: id }).onConflictDoNothing();
    return { ok: true };
  });
  app.post("/offers/:id/comments", { preHandler: requireUser, config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request) => {
    const { id } = request.params as { id: string };
    const body = z.object({ body: z.string().trim().min(2).max(1500) }).parse(request.body);
    const [comment] = await db.insert(comments).values({ offerId: id, userId: request.user.id, body: body.body.replace(/<[^>]*>/g, "") }).returning();
    return { data: comment };
  });
  app.post("/comments/:id/report", { preHandler: requireUser, config: { rateLimit: { max: 10, timeWindow: "1 hour" } } }, async (request) => {
    const { id } = request.params as { id: string };
    const body = z.object({ reason: z.string().min(3).max(300) }).parse(request.body);
    await db.insert(reports).values({ commentId: id, reporterId: request.user.id, reason: body.reason });
    return { ok: true };
  });
}

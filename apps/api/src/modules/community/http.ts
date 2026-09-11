import type { FastifyInstance } from "fastify";
import { desc, eq } from "drizzle-orm";
import { comments, db } from "@promimi/database";
import { z } from "zod";
import { requireStaff, requireUser } from "../../shared/auth/guards.js";
import { createCommentInput } from "./application/create-comment.js";
import { communityRepository } from "./infrastructure/drizzle-community-repository.js";
import { rateLimits } from "../../shared/http/rate-limit.js";

/** Community boundary: favorites, comments and moderation reports. */
export async function registerCommunityHttp(app: FastifyInstance) {
  app.get("/offers/:id/comments", async (request) => {
    const { id } = request.params as { id: string };
    const rows = await communityRepository.commentsForOffer(id);
    return { data: rows.map((comment) => ({ id: comment.id, body: comment.body, createdAt: comment.createdAt, author: comment.user.name ?? "Visitante Promimi" })) };
  });
  app.post("/offers/:id/favorite", { preHandler: requireUser }, async (request) => {
    const { id } = request.params as { id: string };
    await communityRepository.favorite(request.user.id, id);
    return { ok: true };
  });
  app.post("/offers/:id/comments", { preHandler: requireUser, config: { rateLimit: rateLimits.comment } }, async (request) => {
    const { id } = request.params as { id: string };
    const body = z.object({ body: z.string().trim().min(2).max(1500) }).parse(request.body);
    const [comment] = await communityRepository.comment(id, request.user.id, createCommentInput(body.body));
    return { data: comment };
  });
  app.post("/comments/:id/report", { preHandler: requireUser, config: { rateLimit: rateLimits.report } }, async (request) => {
    const { id } = request.params as { id: string };
    const body = z.object({ reason: z.string().min(3).max(300) }).parse(request.body);
    await communityRepository.report(id, request.user.id, body.reason);
    return { ok: true };
  });
  app.get("/admin/comments", { preHandler: requireStaff }, async () => ({ data: await db.query.comments.findMany({ with: { user: true, offer: true }, orderBy: [desc(comments.createdAt)] }) }));
  app.patch("/admin/comments/:id", { preHandler: requireStaff }, async (request) => {
    const { id } = request.params as { id: string }; const { isHidden } = z.object({ isHidden: z.boolean() }).parse(request.body);
    const [comment] = await communityRepository.moderate(id, isHidden); return { data: comment };
  });
}

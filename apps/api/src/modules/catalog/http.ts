import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db, integrations, offers, outboxEvents, publications } from "@promimi/database";
import { z } from "zod";
import { requireStaff } from "../../shared/auth/guards.js";
import { socialCardSvg } from "../../social-card.js";
import { mapOffer, slugify } from "./domain/offer.js";
import { catalogRepository } from "./infrastructure/repository.js";
import { createCategory, updateCategory } from "./application/category-service.js";

const offerInput = z.object({ title: z.string().min(8).max(240), description: z.string().max(5000).optional(), storeId: z.string().uuid(), categoryId: z.string().uuid().optional().nullable(), currentPrice: z.coerce.number().positive(), originalPrice: z.coerce.number().positive().optional().nullable(), couponCode: z.string().max(64).optional().nullable(), affiliateUrl: z.string().url(), imageUrl: z.string().url().optional().nullable(), expiresAt: z.coerce.date().optional().nullable(), status: z.enum(["DRAFT", "PUBLISHED", "EXPIRED", "PAUSED"]).optional() });
const destinationsFor = async () => (await db.select({ provider: integrations.provider }).from(integrations).where(eq(integrations.enabled, true))).map((item) => item.provider).filter((provider) => ["telegram", "whatsapp", "instagram", "facebook", "x"].includes(provider));

/** Catalog boundary: public discovery, offers and tracked outbound links. */
export async function registerCatalogHttp(app: FastifyInstance) {
  app.get("/categories", async () => ({ data: await catalogRepository.activeCategories() }));
  app.get("/stores", async () => ({ data: await catalogRepository.activeStores() }));
  app.get("/offers", async (request) => {
    const query = request.query as { q?: string; store?: string; min?: string; max?: string; category?: string };
    const rows = await catalogRepository.publishedOffers(query);
    const data = rows.filter((item) => (!query.store || item.store.slug === query.store) && (!query.category || item.category?.slug === query.category)).map(mapOffer);
    return { data, total: rows.length };
  });
  app.get("/offers/:slug", async (request, reply) => {
    const item = await catalogRepository.publicOfferBySlug((request.params as { slug: string }).slug);
    if (!item) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return mapOffer(item);
  });
  app.get("/offers/:slug/card.svg", async (request, reply) => {
    const item = await catalogRepository.publicOfferCardBySlug((request.params as { slug: string }).slug);
    if (!item) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return reply.type("image/svg+xml; charset=utf-8").header("cache-control", "public, max-age=300").send(socialCardSvg(item));
  });
  app.post("/offers/:id/click", async (request, reply) => {
    const { id } = request.params as { id: string }; const source = (request.query as { source?: string }).source ?? "direct";
    const offer = await catalogRepository.trackClick(id, source);
    if (!offer) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return { url: offer.url };
  });
  app.get("/offers/:id/go", async (request, reply) => {
    const { id } = request.params as { id: string }; const source = (request.query as { source?: string }).source ?? "direct";
    const offer = await catalogRepository.trackClick(id, source, true);
    if (!offer) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return reply.redirect(offer.url, 302);
  });
  app.get("/admin/offers", { preHandler: requireStaff }, async () => ({ data: (await catalogRepository.adminOffers()).map(mapOffer) }));
  app.post("/admin/offers", { preHandler: requireStaff }, async (request, reply) => {
    const input = offerInput.parse(request.body); const status = input.status ?? "DRAFT"; const discount = input.originalPrice && input.originalPrice > input.currentPrice ? Math.round((1 - input.currentPrice / input.originalPrice) * 100) : null;
    const destinations = status === "PUBLISHED" ? await destinationsFor() : [];
    const offer = await db.transaction(async (tx) => {
      const [createdOffer] = await tx.insert(offers).values({ ...input, slug: `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`, currentPrice: String(input.currentPrice), originalPrice: input.originalPrice ? String(input.originalPrice) : null, discountPercent: discount, status, createdById: request.user.id, publishedAt: status === "PUBLISHED" ? new Date() : null, verifiedAt: new Date() }).returning();
      if (destinations.length) { const created = await tx.insert(publications).values(destinations.map((destination) => ({ offerId: createdOffer.id, destination, status: "PENDING" as const }))).returning({ id: publications.id }); await tx.insert(outboxEvents).values(created.map((publication) => ({ topic: "publication.requested", aggregateId: createdOffer.id, payload: { publicationId: publication.id } }))); }
      return createdOffer;
    });
    return reply.code(201).send({ data: offer });
  });
  app.patch("/admin/offers/:id", { preHandler: requireStaff }, async (request) => {
    const { id } = request.params as { id: string }; const input = offerInput.partial().parse(request.body);
    const destinations = input.status === "PUBLISHED" ? await destinationsFor() : [];
    const offer = await db.transaction(async (tx) => {
      const [updatedOffer] = await tx.update(offers).set({ ...input, currentPrice: input.currentPrice ? String(input.currentPrice) : undefined, originalPrice: input.originalPrice === null ? null : input.originalPrice === undefined ? undefined : String(input.originalPrice), publishedAt: input.status === "PUBLISHED" ? new Date() : undefined, updatedAt: new Date() }).where(eq(offers.id, id)).returning();
      if (updatedOffer && destinations.length) { const existing = await tx.select({ destination: publications.destination }).from(publications).where(eq(publications.offerId, updatedOffer.id)); const seen = new Set(existing.map((item) => item.destination)); const missing = destinations.filter((destination) => !seen.has(destination)); if (missing.length) { const created = await tx.insert(publications).values(missing.map((destination) => ({ offerId: updatedOffer.id, destination, status: "PENDING" as const }))).returning({ id: publications.id }); await tx.insert(outboxEvents).values(created.map((publication) => ({ topic: "publication.requested", aggregateId: updatedOffer.id, payload: { publicationId: publication.id } }))); } }
      return updatedOffer;
    });
    return { data: offer };
  });
  app.get("/admin/categories", { preHandler: requireStaff }, async () => ({ data: await catalogRepository.categories() }));
  app.post("/admin/categories", { preHandler: requireStaff }, async (request, reply) => {
    const input = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional().nullable(), isActive: z.boolean().default(true) }).parse(request.body); const category = await createCategory(input);
    if (!category) return reply.code(409).send({ error: "CATEGORY_EXISTS", message: "Já existe uma categoria com este nome." }); return reply.code(201).send({ data: category[0] });
  });
  app.patch("/admin/categories/:id", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string }; const input = z.object({ name: z.string().trim().min(2).max(80).optional(), description: z.string().trim().max(500).nullable().optional(), isActive: z.boolean().optional() }).parse(request.body);
    const [category] = await updateCategory(id, input);
    if (!category) return reply.code(404).send({ error: "NOT_FOUND", message: "Categoria não encontrada." }); return { data: category };
  });
}

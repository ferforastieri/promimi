import type { FastifyPluginAsync } from "fastify";
import { socialCardSvg } from "../../publishing/application/social-card.js";
import { catalogRepository } from "../infrastructure/repository.js";
import { presentOffer } from "./presenters.js";
import { offerSearchSchema } from "./schemas.js";

export const publicCatalogController: FastifyPluginAsync = async (app) => {
  app.get("/categories", async () => ({
    data: await catalogRepository.activeCategories(),
  }));
  app.get("/stores", async () => ({
    data: await catalogRepository.activeStores(),
  }));
  app.get("/offers", async (request) => {
    const query = offerSearchSchema.parse(request.query);
    const rows = await catalogRepository.publishedOffers(query);
    const data = rows
      .filter(
        (item) =>
          (!query.store || item.store.slug === query.store) &&
          (!query.category || item.category?.slug === query.category),
      )
      .map(presentOffer);
    return { data, total: rows.length };
  });
  app.get("/offers/:slug", async (request, reply) => {
    const item = await catalogRepository.publicOfferBySlug(
      (request.params as { slug: string }).slug,
    );
    if (!item)
      return reply
        .code(404)
        .send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return presentOffer(item);
  });
  app.get("/offers/:slug/card.svg", async (request, reply) => {
    const item = await catalogRepository.publicOfferCardBySlug(
      (request.params as { slug: string }).slug,
    );
    if (!item)
      return reply
        .code(404)
        .send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return reply
      .type("image/svg+xml; charset=utf-8")
      .header("cache-control", "public, max-age=300")
      .send(socialCardSvg(item));
  });
  app.post("/offers/:id/click", async (request, reply) => {
    const { id } = request.params as { id: string };
    const source = (request.query as { source?: string }).source ?? "direct";
    const offer = await catalogRepository.trackClick(id, source);
    if (!offer)
      return reply
        .code(404)
        .send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return { url: offer.url };
  });
  app.get("/offers/:id/go", async (request, reply) => {
    const { id } = request.params as { id: string };
    const source = (request.query as { source?: string }).source ?? "direct";
    const offer = await catalogRepository.trackClick(id, source, true);
    if (!offer)
      return reply
        .code(404)
        .send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return reply.redirect(offer.url, 302);
  });
};

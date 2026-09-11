import type { FastifyPluginAsync } from "fastify";
import { requireStaff } from "../../../shared/auth/guards.js";
import { createOffer } from "../application/create-offer.js";
import { updateOffer } from "../application/update-offer.js";
import { catalogRepository } from "../infrastructure/repository.js";
import { presentOffer } from "./presenters.js";
import { offerInputSchema } from "./schemas.js";

export const adminOffersController: FastifyPluginAsync = async (app) => {
  app.get("/admin/offers", { preHandler: requireStaff }, async () => ({ data: (await catalogRepository.adminOffers()).map(presentOffer) }));
  app.post("/admin/offers", { preHandler: requireStaff }, async (request, reply) => {
    const offer = await createOffer({ ...offerInputSchema.parse(request.body), createdById: request.user.id });
    return reply.code(201).send({ data: offer });
  });
  app.patch("/admin/offers/:id", { preHandler: requireStaff }, async (request) => {
    const { id } = request.params as { id: string };
    return { data: await updateOffer(id, offerInputSchema.partial().parse(request.body)) };
  });
};

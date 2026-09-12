import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireStaff } from "../../../shared/auth/guards.js";
import { publicationRepository } from "../infrastructure/drizzle-publication-repository.js";

/** Publishing boundary: delivery state. The worker performs connector I/O. */
export const publishingController: FastifyPluginAsync = async (app) => {
  app.get("/admin/publications", { preHandler: requireStaff }, async () => ({
    data: await publicationRepository.list(),
  }));
  app.patch(
    "/admin/publications/:id",
    { preHandler: requireStaff },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = z
        .object({ status: z.enum(["PENDING", "PAUSED"]) })
        .parse(request.body);
      const [publication] = await publicationRepository.updateStatus(
        id,
        status,
      );
      if (!publication)
        return reply
          .code(404)
          .send({ error: "NOT_FOUND", message: "Publicação não encontrada." });
      return { data: publication };
    },
  );
};

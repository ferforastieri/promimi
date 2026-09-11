import type { FastifyPluginAsync } from "fastify";
import { requireStaff } from "../../../shared/auth/guards.js";
import { createCategory, updateCategory } from "../application/category-service.js";
import { catalogRepository } from "../infrastructure/repository.js";
import { categoryCreateSchema, categoryUpdateSchema } from "./schemas.js";

export const adminCategoriesController: FastifyPluginAsync = async (app) => {
  app.get("/admin/categories", { preHandler: requireStaff }, async () => ({ data: await catalogRepository.categories() }));
  app.post("/admin/categories", { preHandler: requireStaff }, async (request, reply) => {
    const category = await createCategory(categoryCreateSchema.parse(request.body));
    if (!category) return reply.code(409).send({ error: "CATEGORY_EXISTS", message: "Já existe uma categoria com este nome." });
    return reply.code(201).send({ data: category[0] });
  });
  app.patch("/admin/categories/:id", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const [category] = await updateCategory(id, categoryUpdateSchema.parse(request.body));
    if (!category) return reply.code(404).send({ error: "NOT_FOUND", message: "Categoria não encontrada." });
    return { data: category };
  });
};

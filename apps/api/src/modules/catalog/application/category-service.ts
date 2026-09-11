import { slugify } from "../domain/offer.js";
import { catalogRepository } from "../infrastructure/repository.js";
export async function createCategory(input: { name: string; description?: string | null; isActive: boolean }) { const slug = slugify(input.name); if (await catalogRepository.categoryBySlug(slug)) return null; return catalogRepository.createCategory({ ...input, slug }); }
export const updateCategory = (id: string, input: { name?: string; description?: string | null; isActive?: boolean }) => catalogRepository.updateCategory(id, { ...input, slug: input.name ? slugify(input.name) : undefined });

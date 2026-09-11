import type { categories, offers, stores } from "@promimi/database";

export const presentOffer = (row: typeof offers.$inferSelect & { store: typeof stores.$inferSelect; category: typeof categories.$inferSelect | null }) => ({
  ...row,
  currentPrice: Number(row.currentPrice),
  originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
  store: { id: row.store.id, name: row.store.name, slug: row.store.slug, logoUrl: row.store.logoUrl },
  category: row.category ? { name: row.category.name, slug: row.category.slug } : null
});

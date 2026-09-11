import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { categories, clicks, db, offers, stores } from "@promimi/database";

export type OfferSearch = { q?: string; store?: string; min?: string; max?: string; category?: string };

export const catalogRepository = {
  activeCategories: () => db.select().from(categories).where(eq(categories.isActive, true)),
  activeStores: () => db.select().from(stores).where(eq(stores.isActive, true)),
  async publishedOffers(query: OfferSearch) {
    const filters = [eq(offers.status, "PUBLISHED")];
    if (query.q) filters.push(ilike(offers.title, `%${query.q}%`));
    if (query.min) filters.push(gte(offers.currentPrice, query.min));
    if (query.max) filters.push(lte(offers.currentPrice, query.max));
    return db.query.offers.findMany({ where: and(...filters), with: { store: true, category: true }, orderBy: [desc(offers.publishedAt)] });
  },
  publicOfferBySlug: (slug: string) => db.query.offers.findFirst({ where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")), with: { store: true, category: true } }),
  publicOfferCardBySlug: (slug: string) => db.query.offers.findFirst({ where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")), with: { store: true } }),
  async trackClick(id: string, source: string, publishedOnly = false) {
    const where = publishedOnly ? and(eq(offers.id, id), eq(offers.status, "PUBLISHED")) : eq(offers.id, id);
    const [offer] = await db.select({ url: offers.affiliateUrl }).from(offers).where(where);
    if (!offer) return undefined;
    await db.insert(clicks).values({ offerId: id, source });
    return offer;
  }
};

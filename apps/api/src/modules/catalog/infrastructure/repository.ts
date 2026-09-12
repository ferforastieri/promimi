import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import {
  categories,
  clicks,
  db,
  integrations,
  offers,
  outboxEvents,
  publications,
  stores,
} from "@promimi/infrastructure/database";
import type {
  CreateOfferCommand,
  UpdateOfferCommand,
} from "../application/offer-commands.js";
import type { OfferStatus } from "../domain/offer-policy.js";

export type OfferSearch = {
  q?: string;
  store?: string;
  min?: string;
  max?: string;
  category?: string;
};

export const catalogRepository = {
  activeCategories: () =>
    db.select().from(categories).where(eq(categories.isActive, true)),
  activeStores: () => db.select().from(stores).where(eq(stores.isActive, true)),
  adminOffers: () =>
    db.query.offers.findMany({
      with: { store: true, category: true },
      orderBy: [desc(offers.updatedAt)],
    }),
  categories: () => db.select().from(categories).orderBy(categories.name),
  categoryBySlug: (slug: string) =>
    db.query.categories.findFirst({ where: eq(categories.slug, slug) }),
  createCategory: (value: typeof categories.$inferInsert) =>
    db.insert(categories).values(value).returning(),
  updateCategory: (
    id: string,
    value: Partial<typeof categories.$inferInsert>,
  ) =>
    db
      .update(categories)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning(),
  async enabledPublicationDestinations() {
    return (
      await db
        .select({ provider: integrations.provider })
        .from(integrations)
        .where(eq(integrations.enabled, true))
    )
      .map((item) => item.provider)
      .filter((provider): provider is string =>
        ["telegram", "whatsapp", "instagram", "facebook", "x"].includes(
          provider,
        ),
      );
  },
  async createOffer(
    command: CreateOfferCommand & {
      status: OfferStatus;
      slug: string;
      discountPercent: number | null;
      destinations: string[];
    },
  ) {
    return db.transaction(async (tx) => {
      const [offer] = await tx
        .insert(offers)
        .values({
          ...command,
          currentPrice: String(command.currentPrice),
          originalPrice: command.originalPrice
            ? String(command.originalPrice)
            : null,
          publishedAt: command.status === "PUBLISHED" ? new Date() : null,
          verifiedAt: new Date(),
        })
        .returning();
      await createPublicationEvents(tx, offer.id, command.destinations);
      return offer;
    });
  },
  async updateOffer(
    id: string,
    command: UpdateOfferCommand & {
      discountPercent?: number | null;
      destinations: string[];
    },
  ) {
    return db.transaction(async (tx) => {
      const [offer] = await tx
        .update(offers)
        .set({
          ...command,
          currentPrice:
            command.currentPrice === undefined
              ? undefined
              : String(command.currentPrice),
          originalPrice:
            command.originalPrice === undefined
              ? undefined
              : command.originalPrice === null
                ? null
                : String(command.originalPrice),
          publishedAt: command.status === "PUBLISHED" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(offers.id, id))
        .returning();
      if (!offer) return undefined;
      const existing = await tx
        .select({ destination: publications.destination })
        .from(publications)
        .where(eq(publications.offerId, offer.id));
      const seen = new Set(existing.map((item) => item.destination));
      await createPublicationEvents(
        tx,
        offer.id,
        command.destinations.filter((destination) => !seen.has(destination)),
      );
      return offer;
    });
  },
  async publishedOffers(query: OfferSearch) {
    const filters = [eq(offers.status, "PUBLISHED")];
    if (query.q) filters.push(ilike(offers.title, `%${query.q}%`));
    if (query.min) filters.push(gte(offers.currentPrice, query.min));
    if (query.max) filters.push(lte(offers.currentPrice, query.max));
    return db.query.offers.findMany({
      where: and(...filters),
      with: { store: true, category: true },
      orderBy: [desc(offers.publishedAt)],
    });
  },
  publicOfferBySlug: (slug: string) =>
    db.query.offers.findFirst({
      where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")),
      with: { store: true, category: true },
    }),
  publicOfferCardBySlug: (slug: string) =>
    db.query.offers.findFirst({
      where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")),
      with: { store: true },
    }),
  async trackClick(id: string, source: string, publishedOnly = false) {
    const where = publishedOnly
      ? and(eq(offers.id, id), eq(offers.status, "PUBLISHED"))
      : eq(offers.id, id);
    const [offer] = await db
      .select({ url: offers.affiliateUrl })
      .from(offers)
      .where(where);
    if (!offer) return undefined;
    await db.insert(clicks).values({ offerId: id, source });
    return offer;
  },
};

async function createPublicationEvents(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  offerId: string,
  destinations: string[],
) {
  if (!destinations.length) return;
  const created = await tx
    .insert(publications)
    .values(
      destinations.map((destination) => ({
        offerId,
        destination,
        status: "PENDING" as const,
      })),
    )
    .returning({ id: publications.id });
  await tx
    .insert(outboxEvents)
    .values(
      created.map((publication) => ({
        topic: "publication.requested",
        aggregateId: offerId,
        payload: { publicationId: publication.id },
      })),
    );
}

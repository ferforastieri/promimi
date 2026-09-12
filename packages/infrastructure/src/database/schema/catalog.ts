import {
  index,
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./identity.js";
import { id, offerStatus, timestamps } from "./core.js";

export const categories = pgTable("categories", {
  id: id(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const stores = pgTable("stores", {
  id: id(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const offers = pgTable(
  "offers",
  {
    id: id(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    storeId: uuid("store_id")
      .references(() => stores.id)
      .notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    currentPrice: numeric("current_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    originalPrice: numeric("original_price", { precision: 12, scale: 2 }),
    discountPercent: integer("discount_percent"),
    couponCode: varchar("coupon_code", { length: 64 }),
    affiliateUrl: text("affiliate_url").notNull(),
    sourceUrl: text("source_url"),
    status: offerStatus("status").default("DRAFT").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    index("offers_status_published_idx").on(table.status, table.publishedAt),
    index("offers_store_idx").on(table.storeId),
  ],
);

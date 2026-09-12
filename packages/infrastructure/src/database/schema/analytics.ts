import {
  index,
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { offers } from "./catalog.js";
import { id } from "./core.js";

export const clicks = pgTable(
  "clicks",
  {
    id: id(),
    offerId: uuid("offer_id")
      .references(() => offers.id)
      .notNull(),
    source: varchar("source", { length: 100 }).default("direct").notNull(),
    fingerprint: varchar("fingerprint", { length: 128 }),
    isFiltered: boolean("is_filtered").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clicks_offer_created_idx").on(table.offerId, table.createdAt),
  ],
);

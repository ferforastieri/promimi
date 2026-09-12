import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { offers } from "./catalog.js";
import { id, outboxStatus, publicationStatus, timestamps } from "./core.js";

export const publications = pgTable("publications", {
  id: id(),
  offerId: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  destination: varchar("destination", { length: 80 }).notNull(),
  status: publicationStatus("status").default("PENDING").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  externalId: varchar("external_id", { length: 200 }),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps,
});

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: id(),
    topic: varchar("topic", { length: 120 }).notNull(),
    aggregateId: uuid("aggregate_id"),
    payload: jsonb("payload").notNull(),
    status: outboxStatus("status").default("PENDING").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    availableAt: timestamp("available_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastError: text("last_error"),
    ...timestamps,
  },
  (table) => [
    index("outbox_events_pending_idx").on(table.status, table.availableAt),
  ],
);

import {
  uniqueIndex,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { offers } from "./catalog.js";
import { users } from "./identity.js";
import { id, timestamps } from "./core.js";

export const favorites = pgTable(
  "favorites",
  {
    id: id(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    offerId: uuid("offer_id")
      .references(() => offers.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("favorites_user_offer_idx").on(table.userId, table.offerId),
  ],
);

export const comments = pgTable("comments", {
  id: id(),
  offerId: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  body: text("body").notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  ...timestamps,
});

export const reports = pgTable("reports", {
  id: id(),
  commentId: uuid("comment_id")
    .references(() => comments.id)
    .notNull(),
  reporterId: uuid("reporter_id")
    .references(() => users.id)
    .notNull(),
  reason: varchar("reason", { length: 300 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

import { relations } from "drizzle-orm";
import { routineExecutions, routines } from "./automation.js";
import { clicks } from "./analytics.js";
import { categories, offers, stores } from "./catalog.js";
import { comments, favorites } from "./community.js";
import { authTokens, users } from "./identity.js";
import { publications } from "./publishing.js";

export const offersRelations = relations(offers, ({ many, one }) => ({
  store: one(stores, { fields: [offers.storeId], references: [stores.id] }),
  category: one(categories, {
    fields: [offers.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  favorites: many(favorites),
  publications: many(publications),
  clicks: many(clicks),
}));
export const commentsRelations = relations(comments, ({ one }) => ({
  offer: one(offers, { fields: [comments.offerId], references: [offers.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));
export const favoritesRelations = relations(favorites, ({ one }) => ({
  offer: one(offers, { fields: [favorites.offerId], references: [offers.id] }),
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
}));
export const publicationsRelations = relations(publications, ({ one }) => ({
  offer: one(offers, {
    fields: [publications.offerId],
    references: [offers.id],
  }),
}));
export const clicksRelations = relations(clicks, ({ one }) => ({
  offer: one(offers, { fields: [clicks.offerId], references: [offers.id] }),
}));
export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, { fields: [authTokens.userId], references: [users.id] }),
}));
export const routineExecutionsRelations = relations(
  routineExecutions,
  ({ one }) => ({
    routine: one(routines, {
      fields: [routineExecutions.routineId],
      references: [routines.id],
    }),
  }),
);
export const routinesRelations = relations(routines, ({ many }) => ({
  routineExecutions: many(routineExecutions),
}));

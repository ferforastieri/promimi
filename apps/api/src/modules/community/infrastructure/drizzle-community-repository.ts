import { and, desc, eq } from "drizzle-orm";
import {
  comments,
  db,
  favorites,
  reports,
} from "@promimi/infrastructure/database";
export const communityRepository = {
  commentsForOffer: (offerId: string) =>
    db.query.comments.findMany({
      where: and(eq(comments.offerId, offerId), eq(comments.isHidden, false)),
      with: { user: true },
      orderBy: [desc(comments.createdAt)],
    }),
  favorite: (userId: string, offerId: string) =>
    db.insert(favorites).values({ userId, offerId }).onConflictDoNothing(),
  comment: (offerId: string, userId: string, body: string) =>
    db.insert(comments).values({ offerId, userId, body }).returning(),
  report: (commentId: string, reporterId: string, reason: string) =>
    db.insert(reports).values({ commentId, reporterId, reason }),
  moderationQueue: () =>
    db.query.comments.findMany({
      with: { user: true, offer: true },
      orderBy: [desc(comments.createdAt)],
    }),
  moderate: (id: string, isHidden: boolean) =>
    db
      .update(comments)
      .set({ isHidden, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning(),
};

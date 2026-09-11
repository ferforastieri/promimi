import { desc, eq } from "drizzle-orm";
import { db, publications } from "@promimi/database";
export const publicationRepository = {
  list: () => db.query.publications.findMany({ with: { offer: { with: { store: true } } }, orderBy: [desc(publications.createdAt)], limit: 100 }),
  updateStatus: (id: string, status: "PENDING" | "PAUSED") => db.update(publications).set({ status, error: status === "PENDING" ? null : undefined, updatedAt: new Date() }).where(eq(publications.id, id)).returning()
};

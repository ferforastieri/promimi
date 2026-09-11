import { and, desc, eq, isNull } from "drizzle-orm";
import { authTokens, db, favorites, users } from "@promimi/database";

export const identityRepository = {
  findByEmail: (email: string) => db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) }),
  findById: (id: string) => db.query.users.findFirst({ where: eq(users.id, id) }),
  create: (value: typeof users.$inferInsert) => db.insert(users).values(value).returning(),
  createToken: (value: typeof authTokens.$inferInsert) => db.insert(authTokens).values(value),
  findUsableToken: (tokenHash: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") => db.query.authTokens.findFirst({ where: and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)) }),
  markTokenUsed: (id: string) => db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, id)),
  favoritesFor: (id: string) => db.query.favorites.findMany({ where: eq(favorites.userId, id), with: { offer: { with: { store: true, category: true } } }, orderBy: [desc(favorites.createdAt)] }),
  update: (id: string, value: Partial<typeof users.$inferInsert>) => db.update(users).set({ ...value, updatedAt: new Date() }).where(eq(users.id, id)),
  activeUsers: () => db.select({ id: users.id, email: users.email, name: users.name, role: users.role, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt }).from(users).where(isNull(users.deletedAt)).orderBy(desc(users.createdAt))
};

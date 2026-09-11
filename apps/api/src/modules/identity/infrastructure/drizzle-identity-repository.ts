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
  , verifyEmail: (userId: string, tokenId: string) => db.transaction(async (tx) => { await tx.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId)); await tx.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, tokenId)); })
  , resetPassword: (userId: string, tokenId: string, passwordHash: string) => db.transaction(async (tx) => { await tx.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId)); await tx.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, tokenId)); })
  , saveTotpSecret: (id: string, encryptedSecret: string) => db.update(users).set({ totpSecretEncrypted: encryptedSecret, updatedAt: new Date() }).where(eq(users.id, id))
  , enableTotp: (id: string) => db.update(users).set({ totpEnabled: true, updatedAt: new Date() }).where(eq(users.id, id))
  , updateRole: (id: string, role: "ADMIN" | "EDITOR" | "VISITOR") => db.update(users).set({ role, updatedAt: new Date() }).where(and(eq(users.id, id), isNull(users.deletedAt))).returning({ id: users.id, email: users.email, name: users.name, role: users.role })
};

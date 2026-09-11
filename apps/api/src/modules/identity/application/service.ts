import argon2 from "argon2";
import { and, desc, eq, isNull } from "drizzle-orm";
import { authTokens, db, favorites, users } from "@promimi/database";
import { createOpaqueToken, hashToken } from "../../../crypto.js";

export const identityService = {
  async issueToken(userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const token = createOpaqueToken();
    await db.insert(authTokens).values({ userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    return token;
  },
  findUserByEmail(email: string) { return db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) }); },
  async consumeToken(token: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const record = await db.query.authTokens.findFirst({ where: and(eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)) });
    return record && record.expiresAt >= new Date() ? record : null;
  },
  async markTokenUsed(tokenId: string) { await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, tokenId)); },
  async userProfile(id: string) { return db.query.users.findFirst({ where: eq(users.id, id) }); },
  favorites(id: string) { return db.query.favorites.findMany({ where: eq(favorites.userId, id), with: { offer: { with: { store: true, category: true } } }, orderBy: [desc(favorites.createdAt)] }); },
  async anonymizeUser(id: string) {
    await db.update(users).set({ email: `deleted+${id}@deleted.promimi.invalid`, name: null, passwordHash: await argon2.hash(createOpaqueToken()), totpSecretEncrypted: null, totpEnabled: false, deletedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, id));
  }
};

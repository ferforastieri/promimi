import argon2 from "argon2";
import { createOpaqueToken, hashToken } from "../../../shared/security/crypto.js";
import { identityRepository } from "../infrastructure/drizzle-identity-repository.js";

export const identityService = {
  async register(input: { email: string; password: string; name?: string }) {
    return identityRepository.create({ email: input.email.toLowerCase(), passwordHash: await argon2.hash(input.password), name: input.name });
  },
  async issueToken(userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const token = createOpaqueToken();
    await identityRepository.createToken({ userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    return token;
  },
  findUserByEmail(email: string) { return identityRepository.findByEmail(email); },
  async consumeToken(token: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    const record = await identityRepository.findUsableToken(hashToken(token), purpose);
    return record && record.expiresAt >= new Date() ? record : null;
  },
  markTokenUsed(tokenId: string) { return identityRepository.markTokenUsed(tokenId); },
  userProfile(id: string) { return identityRepository.findById(id); },
  favorites(id: string) { return identityRepository.favoritesFor(id); },
  async anonymizeUser(id: string) {
    await identityRepository.update(id, { email: `deleted+${id}@deleted.promimi.invalid`, name: null, passwordHash: await argon2.hash(createOpaqueToken()), totpSecretEncrypted: null, totpEnabled: false, deletedAt: new Date() });
  }
  , verifyEmail: (userId: string, tokenId: string) => identityRepository.verifyEmail(userId, tokenId)
  , resetPassword: async (userId: string, tokenId: string, password: string) => identityRepository.resetPassword(userId, tokenId, await argon2.hash(password))
  , saveTotpSecret: (id: string, encryptedSecret: string) => identityRepository.saveTotpSecret(id, encryptedSecret)
  , enableTotp: (id: string) => identityRepository.enableTotp(id)
  , activeUsers: () => identityRepository.activeUsers()
  , updateRole: (id: string, role: "ADMIN" | "EDITOR" | "VISITOR") => identityRepository.updateRole(id, role)
};

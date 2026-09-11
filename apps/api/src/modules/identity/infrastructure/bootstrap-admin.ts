import argon2 from "argon2";
import { db, users } from "@promimi/database";
import { eq } from "drizzle-orm";

/** Creates the first admin only when explicit host secrets are present. */
export async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 14) throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 14 characters.");
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return;
  await db.insert(users).values({ email, passwordHash: await argon2.hash(password), role: "ADMIN", emailVerifiedAt: new Date() });
}

import { eq } from "drizzle-orm";
import { db, integrations } from "@promimi/database";
export const integrationRepository = {
  list: () => db.select().from(integrations), find: (provider: string) => db.query.integrations.findFirst({ where: eq(integrations.provider, provider) }),
  save: (value: typeof integrations.$inferInsert) => db.insert(integrations).values(value).onConflictDoUpdate({ target: integrations.provider, set: { enabled: value.enabled, settings: value.settings, credentialsEncrypted: value.credentialsEncrypted, updatedAt: new Date() } }).returning(),
  recordValidation: (id: string, settings: Record<string, unknown>) => db.update(integrations).set({ settings, lastHealthAt: new Date(), updatedAt: new Date() }).where(eq(integrations.id, id))
};

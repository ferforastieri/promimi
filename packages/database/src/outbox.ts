import { and, eq, lte } from "drizzle-orm";
import { db } from "./client.js";
import { outboxEvents } from "./schema.js";

export type OutboxTopic = "publication.requested";

export async function claimOutboxEvents(limit = 100) {
  const candidates = await db.select().from(outboxEvents).where(and(eq(outboxEvents.status, "PENDING"), lte(outboxEvents.availableAt, new Date()))).limit(limit);
  const claimed = [];
  for (const event of candidates) {
    const [locked] = await db.update(outboxEvents).set({ status: "PROCESSING", attempts: event.attempts + 1, updatedAt: new Date() }).where(and(eq(outboxEvents.id, event.id), eq(outboxEvents.status, "PENDING"))).returning();
    if (locked) claimed.push(locked);
  }
  return claimed;
}

export async function completeOutboxEvent(id: string) { await db.update(outboxEvents).set({ status: "SENT", processedAt: new Date(), updatedAt: new Date() }).where(eq(outboxEvents.id, id)); }
export async function failOutboxEvent(id: string, error: string) { await db.update(outboxEvents).set({ status: "PENDING", availableAt: new Date(Date.now() + 60_000), lastError: error.slice(0, 1000), updatedAt: new Date() }).where(eq(outboxEvents.id, id)); }

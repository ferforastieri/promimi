import type PgBoss from "pg-boss";
import {
  claimOutboxEvents,
  completeOutboxEvent,
  failOutboxEvent,
} from "../infrastructure/outbox-repository.js";

/** Bridges committed domain events to PgBoss without losing them between DB and queue. */
export async function registerOutboxRelay(
  boss: PgBoss,
  queueDelivery: (publicationId: string) => Promise<void>,
) {
  await boss.work("dispatch-outbox", async () => {
    for (const event of await claimOutboxEvents()) {
      try {
        if (event.topic !== "publication.requested")
          throw new Error(`Unsupported outbox topic: ${event.topic}`);
        const payload = event.payload as { publicationId?: string };
        if (!payload.publicationId)
          throw new Error("Outbox event without publicationId.");
        await queueDelivery(payload.publicationId);
        await completeOutboxEvent(event.id);
      } catch (error) {
        await failOutboxEvent(
          event.id,
          error instanceof Error ? error.message : "Outbox dispatch failed.",
        );
        throw error;
      }
    }
  });
}

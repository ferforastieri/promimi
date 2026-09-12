import type PgBoss from "pg-boss";
import type { WorkerConfig } from "@promimi/infrastructure/config";
import { deliver } from "../connectors.js";
import type { PublicationOffer } from "../templates.js";
import { workerRepository } from "../infrastructure/worker-repository.js";
export type DeliveryJob = { publicationId: string };
export async function registerDeliveryJob(boss: PgBoss, config: WorkerConfig) {
  await boss.work<DeliveryJob>(
    "deliver-publication",
    { batchSize: 2 },
    async (jobs) => {
      for (const job of jobs) {
        if (await workerRepository.automationPaused()) continue;
        const publication = await workerRepository.publication(
          job.data.publicationId,
        );
        if (
          !publication ||
          publication.status === "SENT" ||
          publication.status === "PAUSED"
        )
          continue;
        try {
          const result = await deliver(
            publication.destination,
            publication.offer as PublicationOffer,
            await workerRepository.integration(publication.destination),
            config,
          );
          await workerRepository.delivered(
            publication.id,
            result,
            publication.attempts + 1,
          );
        } catch (error) {
          await workerRepository.deliveryFailed(
            publication.id,
            publication.attempts + 1,
            error instanceof Error ? error.message : "Falha desconhecida.",
          );
          throw error;
        }
      }
    },
  );
}

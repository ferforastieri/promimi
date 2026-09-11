import type PgBoss from "pg-boss";
import { workerRepository } from "../infrastructure/worker-repository.js";
export const reconciliationInterval = "*/2 * * * *";
export async function registerReconciliationJob(boss: PgBoss, queueDelivery: (id: string) => Promise<void>) { await boss.work("reconcile-publications", async () => { for (const publication of await workerRepository.retryablePublications()) await queueDelivery(publication.id); }); }

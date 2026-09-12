import { loadWorkerConfig } from "@promimi/infrastructure/config/worker";
import { createBoss } from "./infrastructure/pg-boss.js";
import { workerRepository } from "./infrastructure/worker-repository.js";
import {
  registerDeliveryJob,
  type DeliveryJob,
} from "./jobs/deliver-publication.js";
import { registerRoutineJob, type RoutineJob } from "./jobs/run-routine.js";
import {
  registerReconciliationJob,
  reconciliationInterval,
} from "./jobs/reconcile-publications.js";
import {
  registerOfferExpiryJob,
  offerExpiryInterval,
} from "./jobs/expire-offers.js";
import { registerOutboxRelay } from "./jobs/outbox-relay.js";
import { routineScheduleSyncInterval } from "./jobs/sync-routine-schedules.js";

const config = loadWorkerConfig();
const boss = await createBoss(config.DATABASE_URL);
for (const queue of [
  "deliver-publication",
  "run-routine",
  "reconcile-publications",
  "expire-offers",
  "sync-routine-schedules",
  "queue-manual-routines",
  "dispatch-outbox",
])
  await boss.createQueue(queue);
const queueDelivery = async (publicationId: string): Promise<void> => {
  await boss.send(
    "deliver-publication",
    { publicationId } satisfies DeliveryJob,
    {
      singletonKey: publicationId,
      retryLimit: 5,
      retryBackoff: true,
      expireInHours: 24,
    },
  );
};
await registerDeliveryJob(boss, config);
await registerRoutineJob(boss, () => workerRepository.automationPaused());
await registerReconciliationJob(boss, queueDelivery);
await registerOfferExpiryJob(boss);
await registerOutboxRelay(boss, queueDelivery);
const registered = new Set<string>();
const sync = async () => {
  for (const routine of await workerRepository.scheduledRoutines()) {
    const name = `routine-${routine.id}`;
    if (!routine.enabled) {
      await boss.unschedule(name);
      continue;
    }
    await boss.createQueue(name);
    if (!registered.has(name)) {
      await boss.work<RoutineJob>(name, async (jobs) => {
        for (const job of jobs)
          await boss.send("run-routine", job.data, {
            singletonKey: `routine:${job.data.routineId}:${new Date().toISOString().slice(0, 13)}`,
          });
      });
      registered.add(name);
    }
    await boss.schedule(
      name,
      routine.scheduleCron,
      { routineId: routine.id },
      { tz: "America/Sao_Paulo" },
    );
  }
};
await sync();
await boss.work("sync-routine-schedules", sync);
await boss.work("queue-manual-routines", async () => {
  if (await workerRepository.automationPaused()) return;
  for (const item of await workerRepository.queuedExecutions())
    await boss.send(
      "run-routine",
      { routineId: item.routineId, executionId: item.id } satisfies RoutineJob,
      { singletonKey: `manual-routine:${item.id}` },
    );
});
await boss.schedule(
  "reconcile-publications",
  reconciliationInterval,
  {},
  { tz: "America/Sao_Paulo" },
);
await boss.schedule(
  "expire-offers",
  offerExpiryInterval,
  {},
  { tz: "America/Sao_Paulo" },
);
await boss.schedule(
  "sync-routine-schedules",
  routineScheduleSyncInterval,
  {},
  { tz: "America/Sao_Paulo" },
);
await boss.schedule(
  "queue-manual-routines",
  routineScheduleSyncInterval,
  {},
  { tz: "America/Sao_Paulo" },
);
await boss.schedule(
  "dispatch-outbox",
  routineScheduleSyncInterval,
  {},
  { tz: "America/Sao_Paulo" },
);
console.info(
  "Promimi worker ready: outbox relay, delivery retries, reconciliation, offer expiry and routines are active.",
);

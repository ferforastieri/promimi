import PgBoss from "pg-boss";
import { loadConfig } from "@promimi/config";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { categories, db, integrations, offers, publications, routineExecutions, routines, stores } from "@promimi/database";
import { deliver } from "./connectors.js";
import { candidateDiscount, collectFeed, isEligible, slugify, type CandidateOffer, type RoutineFilters } from "./marketplaces.js";
import type { PublicationOffer } from "./templates.js";

const config = loadConfig();
const boss = new PgBoss({ connectionString: config.DATABASE_URL });
await boss.start();
for (const queue of ["deliver-publication", "run-routine", "reconcile-publications", "expire-offers", "sync-routine-schedules", "queue-manual-routines"]) await boss.createQueue(queue);

type DeliveryJob = { publicationId: string };
type RoutineJob = { routineId: string; executionId?: string };
const marketplaceNames = { amazon: "Amazon", "mercado-livre": "Mercado Livre", shopee: "Shopee" } as const;
const socialDestinations = new Set(["telegram", "whatsapp", "instagram", "facebook", "x"]);

async function isAutomationPaused() {
  const control = await db.query.integrations.findFirst({ where: eq(integrations.provider, "automation") });
  return Boolean(control && !control.enabled);
}

async function queueDelivery(publicationId: string) {
  await boss.send("deliver-publication", { publicationId } satisfies DeliveryJob, { singletonKey: publicationId, retryLimit: 5, retryBackoff: true, expireInHours: 24 });
}

await boss.work<DeliveryJob>("deliver-publication", { batchSize: 2 }, async (jobs) => {
  for (const job of jobs) {
    if (await isAutomationPaused()) continue;
    const publication = await db.query.publications.findFirst({ where: eq(publications.id, job.data.publicationId), with: { offer: { with: { store: true } } } });
    if (!publication || publication.status === "SENT" || publication.status === "PAUSED") continue;
    const integration = await db.query.integrations.findFirst({ where: eq(integrations.provider, publication.destination) });
    try {
      const result = await deliver(publication.destination, publication.offer as PublicationOffer, integration);
      await db.update(publications).set({ status: result.status, error: result.error ?? null, externalId: result.externalId ?? null, attempts: publication.attempts + 1, sentAt: result.status === "SENT" ? new Date() : null, updatedAt: new Date() }).where(eq(publications.id, publication.id));
    } catch (error) {
      await db.update(publications).set({ status: "FAILED", attempts: publication.attempts + 1, error: error instanceof Error ? error.message : "Falha desconhecida.", updatedAt: new Date() }).where(eq(publications.id, publication.id));
      throw error;
    }
  }
});

await boss.work<RoutineJob>("run-routine", async (jobs) => {
  for (const job of jobs) {
    const routine = await db.query.routines.findFirst({ where: eq(routines.id, job.data.routineId) });
    const execution = job.data.executionId
      ? await db.query.routineExecutions.findFirst({ where: eq(routineExecutions.id, job.data.executionId) })
      : routine ? (await db.insert(routineExecutions).values({ routineId: routine.id, status: "RUNNING", startedAt: new Date() }).returning())[0] : undefined;
    if (!routine || !execution) continue;
    if (!routine.enabled || await isAutomationPaused()) {
      await db.update(routineExecutions).set({ status: "PAUSED", finishedAt: new Date(), error: "A rotina ou a automação geral está pausada." }).where(eq(routineExecutions.id, execution.id));
      continue;
    }
    if (job.data.executionId) await db.update(routineExecutions).set({ status: "RUNNING", startedAt: new Date(), error: null }).where(eq(routineExecutions.id, execution.id));
    try {
      const enabled = await db.select().from(integrations).where(eq(integrations.enabled, true));
      const feeds = enabled.filter((integration) => integration.provider in marketplaceNames);
      const fetched = await Promise.all(feeds.map(async (integration) => {
        try { return await collectFeed(integration.provider as CandidateOffer["provider"], integration.settings); }
        catch (error) { console.warn({ provider: integration.provider, error: error instanceof Error ? error.message : "unknown" }, "marketplace feed failed"); return []; }
      }));
      const candidates = fetched.flat(); let accepted = 0; let duplicate = 0; let rejected = 0;
      const filters = (routine.filters ?? {}) as RoutineFilters;
      const outgoing = Array.isArray(routine.destinations) ? routine.destinations.filter((destination): destination is string => typeof destination === "string" && socialDestinations.has(destination)) : [];
      for (const candidate of candidates) {
        if (accepted >= routine.dailyLimit || !isEligible(candidate, filters)) { rejected++; continue; }
        const exists = await db.query.offers.findFirst({ where: eq(offers.sourceUrl, candidate.url) });
        const discount = candidateDiscount(candidate);
        if (exists) {
          await db.update(offers).set({ currentPrice: String(candidate.price), originalPrice: candidate.originalPrice ? String(candidate.originalPrice) : null, discountPercent: discount, couponCode: candidate.couponCode ?? null, imageUrl: candidate.imageUrl ?? null, expiresAt: candidate.expiresAt ?? null, verifiedAt: new Date(), updatedAt: new Date() }).where(eq(offers.id, exists.id));
          duplicate++; continue;
        }
        const store = await db.query.stores.findFirst({ where: eq(stores.slug, candidate.provider) });
        if (!store) { rejected++; continue; }
        const category = candidate.category ? await db.query.categories.findFirst({ where: eq(categories.slug, slugify(candidate.category)) }) : undefined;
        const [created] = await db.insert(offers).values({ slug: `${slugify(candidate.title)}-${Math.random().toString(36).slice(2, 7)}`, title: candidate.title, imageUrl: candidate.imageUrl, storeId: store.id, categoryId: category?.id, currentPrice: String(candidate.price), originalPrice: candidate.originalPrice ? String(candidate.originalPrice) : null, discountPercent: discount, couponCode: candidate.couponCode, affiliateUrl: candidate.url, sourceUrl: candidate.url, status: "PUBLISHED", verifiedAt: new Date(), publishedAt: new Date(), expiresAt: candidate.expiresAt ?? null }).returning();
        for (const destination of outgoing) await db.insert(publications).values({ offerId: created.id, destination, status: "PENDING" });
        accepted++;
      }
      await db.update(routineExecutions).set({ status: "SUCCEEDED", finishedAt: new Date(), foundCount: candidates.length, acceptedCount: accepted, duplicateCount: duplicate, rejectedCount: rejected }).where(eq(routineExecutions.id, execution.id));
    } catch (error) {
      await db.update(routineExecutions).set({ status: "FAILED", finishedAt: new Date(), error: error instanceof Error ? error.message : "Falha desconhecida." }).where(eq(routineExecutions.id, execution.id));
      throw error;
    }
  }
});

await boss.work("reconcile-publications", async () => {
  const retryAfter = new Date(Date.now() - 5 * 60_000);
  const pending = await db.select({ id: publications.id }).from(publications).where(or(eq(publications.status, "PENDING"), and(eq(publications.status, "FAILED"), lt(publications.updatedAt, retryAfter)))).orderBy(desc(publications.createdAt)).limit(100);
  for (const publication of pending) await queueDelivery(publication.id);
});

await boss.work("expire-offers", async () => {
  await db.update(offers).set({ status: "EXPIRED", updatedAt: new Date() }).where(and(eq(offers.status, "PUBLISHED"), lt(offers.expiresAt, new Date())));
});

const registeredRoutineSchedules = new Set<string>();
async function syncRoutineSchedules() {
  const all = await db.select({ id: routines.id, enabled: routines.enabled, scheduleCron: routines.scheduleCron }).from(routines);
  for (const routine of all) {
    const jobName = `routine-${routine.id}`;
    if (!routine.enabled) { await boss.unschedule(jobName); continue; }
    await boss.createQueue(jobName);
    if (!registeredRoutineSchedules.has(jobName)) {
      await boss.work<RoutineJob>(jobName, async (jobs) => {
        for (const job of jobs) await boss.send("run-routine", job.data satisfies RoutineJob, { singletonKey: `routine:${job.data.routineId}:${new Date().toISOString().slice(0, 13)}` });
      });
      registeredRoutineSchedules.add(jobName);
    }
    await boss.schedule(jobName, routine.scheduleCron, { routineId: routine.id } satisfies RoutineJob, { tz: "America/Sao_Paulo" });
  }
}

await syncRoutineSchedules();
await boss.work("sync-routine-schedules", syncRoutineSchedules);

await boss.work("queue-manual-routines", async () => {
  if (await isAutomationPaused()) return;
  const queued = await db.select({ id: routineExecutions.id, routineId: routineExecutions.routineId }).from(routineExecutions).where(eq(routineExecutions.status, "QUEUED")).limit(100);
  for (const execution of queued) await boss.send("run-routine", { routineId: execution.routineId, executionId: execution.id } satisfies RoutineJob, { singletonKey: `manual-routine:${execution.id}` });
});

await boss.schedule("reconcile-publications", "*/2 * * * *", {}, { tz: "America/Sao_Paulo" });
await boss.schedule("expire-offers", "*/15 * * * *", {}, { tz: "America/Sao_Paulo" });
await boss.schedule("sync-routine-schedules", "* * * * *", {}, { tz: "America/Sao_Paulo" });
await boss.schedule("queue-manual-routines", "* * * * *", {}, { tz: "America/Sao_Paulo" });
console.info("Promimi worker ready: delivery retries, reconciliation, offer expiry and routines are active.");

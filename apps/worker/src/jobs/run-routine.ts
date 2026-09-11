import type PgBoss from "pg-boss";
import { candidateDiscount, collectFeed, isEligible, slugify, type CandidateOffer, type RoutineFilters } from "../marketplaces.js";
import { workerRepository } from "../infrastructure/worker-repository.js";
export type RoutineJob = { routineId: string; executionId?: string };
const socialDestinations = new Set(["telegram", "whatsapp", "instagram", "facebook", "x"]);

/** Uses the worker port; all PostgreSQL access is contained in infrastructure. */
export async function registerRoutineJob(boss: PgBoss, paused: () => Promise<boolean>) {
  await boss.work<RoutineJob>("run-routine", async (jobs) => { for (const job of jobs) {
    const routine = await workerRepository.routine(job.data.routineId); const execution = job.data.executionId ? await workerRepository.execution(job.data.executionId) : routine ? (await workerRepository.startExecution(routine.id))[0] : undefined;
    if (!routine || !execution) continue;
    if (!routine.enabled || await paused()) { await workerRepository.executionStatus(execution.id, "PAUSED", { finishedAt: new Date(), error: "A rotina ou a automação geral está pausada." }); continue; }
    if (job.data.executionId) await workerRepository.executionStatus(execution.id, "RUNNING", { startedAt: new Date(), error: null });
    try {
      const feeds = (await workerRepository.enabledIntegrations()).filter((item) => ["amazon", "mercado-livre", "shopee"].includes(item.provider));
      const fetched = await Promise.all(feeds.map(async (item) => { try { return await collectFeed(item.provider as CandidateOffer["provider"], item.settings); } catch (error) { console.warn({ provider: item.provider, error: error instanceof Error ? error.message : "unknown" }, "marketplace feed failed"); return []; } }));
      let accepted = 0, duplicate = 0, rejected = 0; const candidates = fetched.flat(); const filters = (routine.filters ?? {}) as RoutineFilters; const destinations = Array.isArray(routine.destinations) ? routine.destinations.filter((item): item is string => typeof item === "string" && socialDestinations.has(item)) : [];
      for (const candidate of candidates) {
        if (accepted >= routine.dailyLimit || !isEligible(candidate, filters)) { rejected++; continue; }
        const existing = await workerRepository.offerBySource(candidate.url); const discount = candidateDiscount(candidate);
        if (existing) { await workerRepository.refreshOffer(existing.id, { currentPrice: String(candidate.price), originalPrice: candidate.originalPrice ? String(candidate.originalPrice) : null, discountPercent: discount, couponCode: candidate.couponCode ?? null, imageUrl: candidate.imageUrl ?? null, expiresAt: candidate.expiresAt ?? null, verifiedAt: new Date() }); duplicate++; continue; }
        const store = await workerRepository.store(candidate.provider); if (!store) { rejected++; continue; }
        const category = candidate.category ? await workerRepository.category(slugify(candidate.category)) : undefined;
        await workerRepository.createAutomatedOffer({ slug: `${slugify(candidate.title)}-${Math.random().toString(36).slice(2, 7)}`, title: candidate.title, imageUrl: candidate.imageUrl, storeId: store.id, categoryId: category?.id, currentPrice: String(candidate.price), originalPrice: candidate.originalPrice ? String(candidate.originalPrice) : null, discountPercent: discount, couponCode: candidate.couponCode, affiliateUrl: candidate.url, sourceUrl: candidate.url, status: "PUBLISHED", verifiedAt: new Date(), publishedAt: new Date(), expiresAt: candidate.expiresAt ?? null }, destinations); accepted++;
      }
      await workerRepository.executionStatus(execution.id, "SUCCEEDED", { finishedAt: new Date(), foundCount: candidates.length, acceptedCount: accepted, duplicateCount: duplicate, rejectedCount: rejected });
    } catch (error) { await workerRepository.executionStatus(execution.id, "FAILED", { finishedAt: new Date(), error: error instanceof Error ? error.message : "Falha desconhecida." }); throw error; }
  }});
}

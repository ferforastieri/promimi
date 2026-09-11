import type PgBoss from "pg-boss";
import { workerRepository } from "../infrastructure/worker-repository.js";
export const offerExpiryInterval = "*/15 * * * *";
export async function registerOfferExpiryJob(boss: PgBoss) { await boss.work("expire-offers", () => workerRepository.expireOffers()); }

import type { FastifyPluginAsync } from "fastify";
import { requireStaff } from "../../../shared/auth/guards.js";
import { toStatistics } from "../application/get-statistics.js";
import { analyticsRepository } from "../infrastructure/drizzle-analytics-repository.js";

/** Analytics boundary: filtered statistics; raw operational data never leaves this module. */
export const analyticsController: FastifyPluginAsync = async (app) => {
  app.get("/admin/statistics", { preHandler: requireStaff }, async () => {
    const [totals, sources] = await Promise.all([analyticsRepository.totals(), analyticsRepository.sources()]);
    return { data: toStatistics(totals.rows[0], sources.rows) };
  });
};

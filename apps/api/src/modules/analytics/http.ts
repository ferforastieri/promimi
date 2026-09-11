import type { FastifyInstance } from "fastify";
import { db } from "@promimi/database";
import { sql } from "drizzle-orm";
import { requireStaff } from "../../auth.js";

/** Analytics boundary: filtered statistics; raw operational data never leaves this module. */
export async function registerAnalyticsHttp(app: FastifyInstance) {
  app.get("/admin/statistics", { preHandler: requireStaff }, async () => {
    const result = await db.execute<{ active: string; raw_clicks: string; filtered_clicks: string; comments: string }>(sql`select (select count(*) from offers where status = 'PUBLISHED') as active, (select count(*) from clicks where created_at > now() - interval '24 hours') as raw_clicks, (select count(*) from clicks where created_at > now() - interval '24 hours' and is_filtered = false) as filtered_clicks, (select count(*) from comments where is_hidden = false) as comments`);
    const sources = await db.execute<{ source: string; clicks: string }>(sql`select source, count(*) as clicks from clicks where created_at > now() - interval '30 days' and is_filtered = false group by source order by clicks desc`); const row = result.rows[0];
    return { data: { activeOffers: Number(row?.active ?? 0), rawClicks24h: Number(row?.raw_clicks ?? 0), clicks24h: Number(row?.filtered_clicks ?? 0), visibleComments: Number(row?.comments ?? 0), clicksBySource: sources.rows.map((source) => ({ source: source.source, clicks: Number(source.clicks) })) } };
  });
}

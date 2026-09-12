import { db } from "@promimi/infrastructure/database";
import { sql } from "drizzle-orm";
export const analyticsRepository = {
  totals: () =>
    db.execute<{
      active: string;
      raw_clicks: string;
      filtered_clicks: string;
      comments: string;
    }>(
      sql`select (select count(*) from offers where status = 'PUBLISHED') as active, (select count(*) from clicks where created_at > now() - interval '24 hours') as raw_clicks, (select count(*) from clicks where created_at > now() - interval '24 hours' and is_filtered = false) as filtered_clicks, (select count(*) from comments where is_hidden = false) as comments`,
    ),
  sources: () =>
    db.execute<{ source: string; clicks: string }>(
      sql`select source, count(*) as clicks from clicks where created_at > now() - interval '30 days' and is_filtered = false group by source order by clicks desc`,
    ),
};

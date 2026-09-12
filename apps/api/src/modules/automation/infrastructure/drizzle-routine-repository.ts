import { desc, eq } from "drizzle-orm";
import {
  db,
  integrations,
  routineExecutions,
  routines,
} from "@promimi/infrastructure/database";
export const routineRepository = {
  list: () =>
    db.query.routines.findMany({
      with: {
        routineExecutions: {
          orderBy: [desc(routineExecutions.createdAt)],
          limit: 5,
        },
      },
      orderBy: [desc(routines.updatedAt)],
    }),
  find: (id: string) =>
    db.query.routines.findFirst({ where: eq(routines.id, id) }),
  create: (value: typeof routines.$inferInsert) =>
    db.insert(routines).values(value).returning(),
  update: (id: string, value: Partial<typeof routines.$inferInsert>) =>
    db
      .update(routines)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(routines.id, id))
      .returning(),
  queueExecution: (routineId: string) =>
    db
      .insert(routineExecutions)
      .values({ routineId, status: "QUEUED" })
      .returning(),
  automationControl: () =>
    db.query.integrations.findFirst({
      where: eq(integrations.provider, "automation"),
    }),
  setPaused: (paused: boolean) =>
    db
      .insert(integrations)
      .values({ provider: "automation", enabled: !paused, settings: {} })
      .onConflictDoUpdate({
        target: integrations.provider,
        set: { enabled: !paused, updatedAt: new Date() },
      }),
};

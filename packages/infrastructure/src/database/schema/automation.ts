import {
  index,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { executionStatus, id, timestamps } from "./core.js";

export const integrations = pgTable("integrations", {
  id: id(),
  provider: varchar("provider", { length: 60 }).notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  credentialsEncrypted: text("credentials_encrypted"),
  settings: jsonb("settings").default({}),
  lastHealthAt: timestamp("last_health_at", { withTimezone: true }),
  ...timestamps,
});

export const routines = pgTable("routines", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  scheduleCron: varchar("schedule_cron", { length: 80 })
    .default("0 * * * *")
    .notNull(),
  filters: jsonb("filters").default({}),
  destinations: jsonb("destinations").default([]),
  dailyLimit: integer("daily_limit").default(100).notNull(),
  ...timestamps,
});

export const routineExecutions = pgTable(
  "routine_executions",
  {
    id: id(),
    routineId: uuid("routine_id")
      .references(() => routines.id, { onDelete: "cascade" })
      .notNull(),
    status: executionStatus("status").default("QUEUED").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    foundCount: integer("found_count").default(0).notNull(),
    acceptedCount: integer("accepted_count").default(0).notNull(),
    duplicateCount: integer("duplicate_count").default(0).notNull(),
    rejectedCount: integer("rejected_count").default(0).notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("routine_executions_routine_created_idx").on(
      table.routineId,
      table.createdAt,
    ),
  ],
);

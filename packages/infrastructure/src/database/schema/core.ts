import { pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

/** Shared column factories and enum types used across database domains. */
export const id = () => uuid("id").defaultRandom().primaryKey();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const role = pgEnum("user_role", ["ADMIN", "EDITOR", "VISITOR"]);
export const offerStatus = pgEnum("offer_status", [
  "DRAFT",
  "PUBLISHED",
  "EXPIRED",
  "PAUSED",
]);
export const publicationStatus = pgEnum("publication_status", [
  "PENDING",
  "SENT",
  "FAILED",
  "PAUSED",
]);
export const tokenPurpose = pgEnum("token_purpose", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);
export const executionStatus = pgEnum("execution_status", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "PAUSED",
]);
export const outboxStatus = pgEnum("outbox_status", [
  "PENDING",
  "PROCESSING",
  "SENT",
  "FAILED",
]);

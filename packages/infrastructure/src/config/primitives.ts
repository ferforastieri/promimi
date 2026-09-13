import { z } from "zod";

export const url = z.string().url();

export const databaseEnvironmentSchema = z.object({
  DATABASE_URL: url,
});

export const applicationSecrets = z.object({
  JWT_SECRET: z.string().min(32),
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32),
});

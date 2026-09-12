import { z } from "zod";

export const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const url = z.string().url();
const applicationSecrets = z.object({
  JWT_SECRET: z.string().min(32),
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32),
});

export const apiEnvironmentSchema = databaseEnvironmentSchema
  .merge(applicationSecrets)
  .extend({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    APP_URL: url.default("http://localhost:3000"),
    ADMIN_URL: url.optional(),
    API_URL: url.default("http://localhost:3001"),
    PUBLIC_API_URL: url.optional(),
    BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().min(14).optional(),
  });

export const workerEnvironmentSchema = databaseEnvironmentSchema
  .merge(applicationSecrets)
  .extend({
    API_URL: url.default("http://localhost:3001"),
    PUBLIC_API_URL: url.optional(),
  });

const hostname = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/,
    "Expected a hostname without protocol or port.",
  );
export const adminEnvironmentSchema = z.object({
  ADMIN_PREVIEW_ALLOWED_HOSTS: z
    .string()
    .optional()
    .transform(
      (value) =>
        value
          ?.split(",")
          .map((host) => host.trim())
          .filter(Boolean) ?? [],
    )
    .pipe(z.array(hostname)),
});

export const whatsappEnvironmentSchema = z.object({
  WHATSAPP_BRIDGE_TOKEN: z.string().min(32),
  WHATSAPP_PORT: z.coerce.number().int().min(1).max(65_535).default(3100),
  WHATSAPP_SESSION_PATH: z.string().min(1).default("/data/session"),
});
export const mobileEnvironmentSchema = z.object({
  PROMIMI_MOBILE_SITE_URL: url.optional(),
});

export type ApiConfig = z.infer<typeof apiEnvironmentSchema>;
export type WorkerConfig = z.infer<typeof workerEnvironmentSchema>;
export type AdminConfig = z.infer<typeof adminEnvironmentSchema>;
export type WhatsappConfig = z.infer<typeof whatsappEnvironmentSchema>;
export type MobileConfig = z.infer<typeof mobileEnvironmentSchema>;

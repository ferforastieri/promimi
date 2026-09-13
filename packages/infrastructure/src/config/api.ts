import { z } from "zod";
import { applicationSecrets, databaseEnvironmentSchema, url } from "./primitives.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

const originList = z
  .string()
  .optional()
  .transform(
    (value) =>
      value
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [],
  )
  .pipe(z.array(url));

export const apiEnvironmentSchema = databaseEnvironmentSchema
  .merge(applicationSecrets)
  .extend({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    APP_URL: url.default("http://localhost:3000"),
    CORS_ALLOWED_ORIGINS: originList,
    API_URL: url.default("http://localhost:3001"),
    PUBLIC_API_URL: url.optional(),
    BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().min(14).optional(),
  });

export type ApiConfig = z.infer<typeof apiEnvironmentSchema>;
export const loadApiConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => apiEnvironmentSchema.parse(environment);

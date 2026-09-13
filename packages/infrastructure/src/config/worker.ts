import { z } from "zod";
import { applicationSecrets, databaseEnvironmentSchema, url } from "./primitives.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const workerEnvironmentSchema = databaseEnvironmentSchema
  .merge(applicationSecrets)
  .extend({
    API_URL: url.default("http://localhost:3001"),
    PUBLIC_API_URL: url.optional(),
  });

export type WorkerConfig = z.infer<typeof workerEnvironmentSchema>;
export const loadWorkerConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => workerEnvironmentSchema.parse(environment);

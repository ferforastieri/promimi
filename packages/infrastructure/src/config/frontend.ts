import { z } from "zod";
import { url } from "./primitives.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const frontendEnvironmentSchema = z.object({
  API_URL: url.default("http://localhost:3001"),
  PUBLIC_API_URL: url.optional(),
});

export type FrontendConfig = z.infer<typeof frontendEnvironmentSchema>;

export const loadFrontendConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => frontendEnvironmentSchema.parse(environment);

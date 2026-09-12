import { apiEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";
export const loadApiConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => apiEnvironmentSchema.parse(environment);

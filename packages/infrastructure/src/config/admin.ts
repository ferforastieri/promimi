import { adminEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";
export const loadAdminConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => adminEnvironmentSchema.parse(environment);

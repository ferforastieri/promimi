import { frontendEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const loadFrontendConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => frontendEnvironmentSchema.parse(environment);

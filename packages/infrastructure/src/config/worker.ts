import { workerEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";
export const loadWorkerConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => workerEnvironmentSchema.parse(environment);

import { databaseEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";
export const loadDatabaseConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => databaseEnvironmentSchema.parse(environment);

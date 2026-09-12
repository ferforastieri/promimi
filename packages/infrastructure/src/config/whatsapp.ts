import { whatsappEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";
export const loadWhatsappConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => whatsappEnvironmentSchema.parse(environment);

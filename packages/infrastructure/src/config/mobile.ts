import { mobileEnvironmentSchema } from "./environment.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const loadMobileConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => mobileEnvironmentSchema.parse(environment);
export const loadMobileReleaseConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => {
  const config = loadMobileConfig(environment);
  if (!config.PROMIMI_MOBILE_SITE_URL?.startsWith("https://"))
    throw new Error(
      "PROMIMI_MOBILE_SITE_URL precisa ser uma URL HTTPS pública para gerar o release Android.",
    );
  return config as typeof config & { PROMIMI_MOBILE_SITE_URL: string };
};

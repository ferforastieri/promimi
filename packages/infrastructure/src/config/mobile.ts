import { z } from "zod";
import { url } from "./primitives.js";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const mobileEnvironmentSchema = z.object({
  PROMIMI_MOBILE_SITE_URL: url.optional(),
});

export type MobileConfig = z.infer<typeof mobileEnvironmentSchema>;

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

import { z } from "zod";
import { runtimeEnvironment, type RuntimeEnvironment } from "./runtime.js";

export const whatsappEnvironmentSchema = z.object({
  WHATSAPP_BRIDGE_TOKEN: z.string().min(32),
  WHATSAPP_PORT: z.coerce.number().int().min(1).max(65_535).default(3100),
  WHATSAPP_SESSION_PATH: z.string().min(1).default("/data/session"),
});

export type WhatsappConfig = z.infer<typeof whatsappEnvironmentSchema>;
export const loadWhatsappConfig = (
  environment: RuntimeEnvironment = runtimeEnvironment,
) => whatsappEnvironmentSchema.parse(environment);

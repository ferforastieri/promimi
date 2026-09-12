import { z } from "zod";

const hostnameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/, "Expected a hostname without protocol or port.");

export const adminEnvironmentSchema = z.object({
  ADMIN_PREVIEW_ALLOWED_HOSTS: z
    .string()
    .optional()
    .transform((value) => value?.split(",").map((host) => host.trim()).filter(Boolean) ?? [])
    .pipe(z.array(hostnameSchema)),
});

export type AdminConfig = z.infer<typeof adminEnvironmentSchema>;

export const loadAdminConfig = (env = process.env): AdminConfig => adminEnvironmentSchema.parse(env);

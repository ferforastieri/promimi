import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:3001"),
  PUBLIC_API_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  PORT: z.coerce.number().default(3001)
});

export type AppConfig = z.infer<typeof schema>;
export const loadConfig = (env = process.env): AppConfig => schema.parse(env);

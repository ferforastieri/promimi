import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import type { ApiConfig } from "@promimi/infrastructure/config";
import { db, integrations } from "@promimi/infrastructure/database";
import { decryptSecret } from "../security/crypto.js";

type Mail = { to: string; subject: string; text: string };
type SmtpSettings = { host?: unknown; port?: unknown; from?: unknown };
type SmtpCredentials = { user?: string; password?: string };

export async function deliverMail(message: Mail, config: ApiConfig) {
  const integration = await db.query.integrations.findFirst({
    where: eq(integrations.provider, "smtp"),
  });
  const settings = (integration?.settings ?? {}) as SmtpSettings;
  if (
    !integration?.enabled ||
    typeof settings.host !== "string" ||
    typeof settings.from !== "string"
  ) {
    // Deliberately do not expose reset/verification links through logs.
    return { delivered: false, reason: "SMTP_NOT_CONFIGURED" as const };
  }
  const credentials = integration.credentialsEncrypted
    ? decryptSecret<SmtpCredentials>(
        integration.credentialsEncrypted,
        config.INTEGRATION_ENCRYPTION_KEY,
      )
    : {};
  const port = typeof settings.port === "number" ? settings.port : 587;
  const transport = nodemailer.createTransport({
    host: settings.host,
    port,
    secure: port === 465,
    auth: credentials.user
      ? { user: credentials.user, pass: credentials.password }
      : undefined,
  });
  await transport.sendMail({ from: settings.from, ...message });
  return { delivered: true as const };
}

export const verificationMail = (email: string, url: string): Mail => ({
  to: email,
  subject: "Confirme seu e-mail no Promimi",
  text: `Confirme seu e-mail: ${url}`,
});
export const passwordResetMail = (email: string, url: string): Mail => ({
  to: email,
  subject: "Redefina sua senha do Promimi",
  text: `Redefina sua senha: ${url}`,
});

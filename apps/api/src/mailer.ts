import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; text: string };
const configured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);

export async function deliverMail(message: Mail) {
  if (!configured()) {
    // Deliberately do not expose reset/verification links through logs.
    return { delivered: false, reason: "SMTP_NOT_CONFIGURED" as const };
  }
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587), secure: Number(process.env.SMTP_PORT) === 465, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined });
  await transport.sendMail({ from: process.env.SMTP_FROM, ...message });
  return { delivered: true as const };
}

export const verificationMail = (email: string, url: string): Mail => ({ to: email, subject: "Confirme seu e-mail no Promimi", text: `Confirme seu e-mail: ${url}` });
export const passwordResetMail = (email: string, url: string): Mail => ({ to: email, subject: "Redefina sua senha do Promimi", text: `Redefina sua senha: ${url}` });

import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { z } from "zod";
import { requireStaff, requireUser } from "../../../shared/auth/guards.js";
import {
  decryptSecret,
  encryptSecret,
} from "../../../shared/security/crypto.js";
import {
  deliverMail,
  passwordResetMail,
  verificationMail,
} from "../../../shared/notifications/mailer.js";
import { authenticator } from "otplib";
import {
  clearSession,
  establishSession,
} from "../../../shared/auth/session.js";
import { identityService } from "../application/service.js";
import { rateLimits } from "../../../shared/http/rate-limit.js";

/** Identity boundary: browser sessions, credentials, MFA and account lifecycle. */
export const identityController: FastifyPluginAsync = async (app) => {
  const { APP_URL: publicUrl, INTEGRATION_ENCRYPTION_KEY: encryptionKey } =
    app.promimiConfig;
  app.post(
    "/auth/register",
    { config: { rateLimit: rateLimits.registration } },
    async (request, reply) => {
      const input = z
        .object({
          email: z.string().email(),
          password: z.string().min(10),
          name: z.string().min(2).max(120).optional(),
        })
        .parse(request.body);
      const exists = await identityService.findUserByEmail(input.email);
      if (exists)
        return reply
          .code(409)
          .send({
            error: "EMAIL_IN_USE",
            message: "Este e-mail já está cadastrado.",
          });
      const [user] = await identityService.register(input);
      const token = await identityService.issueToken(
        user.id,
        "EMAIL_VERIFICATION",
      );
      await deliverMail(
        verificationMail(
          user.email,
          `${publicUrl}/verificar-email?token=${encodeURIComponent(token)}`,
        ),
        app.promimiConfig,
      );
      establishSession(app, reply, {
        id: user.id,
        role: user.role,
        email: user.email,
      });
      return reply
        .code(201)
        .send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          verificationPending: true,
        });
    },
  );
  app.post(
    "/auth/verify-email",
    { config: { rateLimit: rateLimits.tokenAction } },
    async (request, reply) => {
      const { token } = z
        .object({ token: z.string().min(20) })
        .parse(request.body);
      const record = await identityService.consumeToken(
        token,
        "EMAIL_VERIFICATION",
      );
      if (!record)
        return reply
          .code(400)
          .send({
            error: "INVALID_TOKEN",
            message: "Este link expirou ou já foi utilizado.",
          });
      await identityService.verifyEmail(record.userId, record.id);
      return { ok: true };
    },
  );
  app.post(
    "/auth/request-password-reset",
    { config: { rateLimit: rateLimits.passwordReset } },
    async (request) => {
      const { email } = z
        .object({ email: z.string().email() })
        .parse(request.body);
      const user = await identityService.findUserByEmail(email);
      if (user) {
        const token = await identityService.issueToken(
          user.id,
          "PASSWORD_RESET",
        );
        await deliverMail(
          passwordResetMail(
            user.email,
            `${publicUrl}/redefinir-senha?token=${encodeURIComponent(token)}`,
          ),
          app.promimiConfig,
        );
      }
      return { ok: true };
    },
  );
  app.post(
    "/auth/reset-password",
    { config: { rateLimit: rateLimits.login } },
    async (request, reply) => {
      const body = z
        .object({ token: z.string().min(20), password: z.string().min(10) })
        .parse(request.body);
      const record = await identityService.consumeToken(
        body.token,
        "PASSWORD_RESET",
      );
      if (!record)
        return reply
          .code(400)
          .send({
            error: "INVALID_TOKEN",
            message: "Este link expirou ou já foi utilizado.",
          });
      await identityService.resetPassword(
        record.userId,
        record.id,
        body.password,
      );
      return { ok: true };
    },
  );
  app.post(
    "/auth/login",
    { config: { rateLimit: rateLimits.login } },
    async (request, reply) => {
      const input = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
          totpCode: z
            .string()
            .regex(/^\d{6}$/)
            .optional(),
        })
        .parse(request.body);
      const user = await identityService.findUserByEmail(input.email);
      if (
        !user ||
        user.deletedAt ||
        !(await argon2.verify(user.passwordHash, input.password))
      )
        return reply
          .code(401)
          .send({
            error: "INVALID_CREDENTIALS",
            message: "E-mail ou senha incorretos.",
          });
      if (
        user.role === "ADMIN" &&
        user.totpEnabled &&
        user.totpSecretEncrypted
      ) {
        const secret = decryptSecret<string>(
          user.totpSecretEncrypted,
          encryptionKey,
        );
        if (
          !input.totpCode ||
          !authenticator.verify({ token: input.totpCode, secret })
        )
          return reply
            .code(401)
            .send({
              error: "TOTP_REQUIRED",
              message: "Informe o código do seu autenticador.",
            });
      }
      establishSession(app, reply, {
        id: user.id,
        role: user.role,
        email: user.email,
      });
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },
  );
  app.post(
    "/auth/logout",
    { preHandler: requireUser },
    async (_request, reply) => {
      clearSession(app, reply);
      return { ok: true };
    },
  );
  app.get("/me", { preHandler: requireUser }, async (request, reply) => {
    const user = await identityService.userProfile(request.user.id);
    if (!user || user.deletedAt)
      return reply
        .code(404)
        .send({ error: "NOT_FOUND", message: "Conta não encontrada." });
    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  });
  app.get("/me/favorites", { preHandler: requireUser }, async (request) => ({
    data: await identityService.favorites(request.user.id),
  }));
  app.delete(
    "/me",
    {
      preHandler: requireUser,
      config: { rateLimit: rateLimits.accountDeletion },
    },
    async (request, reply) => {
      await identityService.anonymizeUser(request.user.id);
      clearSession(app, reply);
      return { ok: true };
    },
  );
  app.post(
    "/admin/totp/setup",
    { preHandler: requireStaff },
    async (request, reply) => {
      if (request.user.role !== "ADMIN")
        return reply
          .code(403)
          .send({
            error: "FORBIDDEN",
            message: "Apenas administradores configuram TOTP.",
          });
      const secret = authenticator.generateSecret();
      await identityService.saveTotpSecret(
        request.user.id,
        encryptSecret(secret, encryptionKey),
      );
      return {
        secret,
        otpauthUrl: authenticator.keyuri(request.user.email, "Promimi", secret),
        message: "Confirme o código de seis dígitos para concluir a ativação.",
      };
    },
  );
  app.post(
    "/admin/totp/confirm",
    { preHandler: requireStaff },
    async (request, reply) => {
      if (request.user.role !== "ADMIN")
        return reply
          .code(403)
          .send({
            error: "FORBIDDEN",
            message: "Apenas administradores configuram TOTP.",
          });
      const { code } = z
        .object({ code: z.string().regex(/^\d{6}$/) })
        .parse(request.body);
      const user = await identityService.userProfile(request.user.id);
      if (!user?.totpSecretEncrypted)
        return reply
          .code(400)
          .send({
            error: "TOTP_NOT_STARTED",
            message: "Inicie a configuração antes de confirmar.",
          });
      if (
        !authenticator.verify({
          token: code,
          secret: decryptSecret<string>(
            user.totpSecretEncrypted,
            encryptionKey,
          ),
        })
      )
        return reply
          .code(400)
          .send({ error: "INVALID_TOTP", message: "Código inválido." });
      await identityService.enableTotp(request.user.id);
      return { ok: true };
    },
  );
  app.get("/admin/users", { preHandler: requireStaff }, async () => ({
    data: await identityService.activeUsers(),
  }));
  app.patch(
    "/admin/users/:id",
    { preHandler: requireStaff },
    async (request, reply) => {
      if (request.user.role !== "ADMIN")
        return reply
          .code(403)
          .send({
            error: "FORBIDDEN",
            message: "Apenas administradores alteram papéis.",
          });
      const { id } = request.params as { id: string };
      const { role: nextRole } = z
        .object({ role: z.enum(["ADMIN", "EDITOR", "VISITOR"]) })
        .parse(request.body);
      if (id === request.user.id && nextRole !== "ADMIN")
        return reply
          .code(400)
          .send({
            error: "LAST_ADMIN",
            message: "Não remova seu próprio acesso administrativo.",
          });
      const [user] = await identityService.updateRole(id, nextRole);
      if (!user)
        return reply
          .code(404)
          .send({ error: "NOT_FOUND", message: "Usuário não encontrado." });
      return { data: user };
    },
  );
};

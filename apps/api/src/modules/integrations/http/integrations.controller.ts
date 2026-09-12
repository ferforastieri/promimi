import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireStaff } from "../../../shared/auth/guards.js";
import {
  decryptSecret,
  encryptSecret,
} from "../../../shared/security/crypto.js";
import { parseDestinations } from "../application/whatsapp-destinations.js";
import { providers } from "../domain/provider.js";
import { integrationRepository } from "../infrastructure/drizzle-integration-repository.js";

/** Integrations boundary: credentials are encrypted at rest and never returned by HTTP. */
export const integrationsController: FastifyPluginAsync = async (app) => {
  const encryptionKey = app.promimiConfig.INTEGRATION_ENCRYPTION_KEY;
  app.get("/admin/integrations", { preHandler: requireStaff }, async () => ({
    data: (await integrationRepository.list()).map(
      ({ credentialsEncrypted: _secret, ...integration }) => integration,
    ),
  }));
  app.put(
    "/admin/integrations/:provider",
    { preHandler: requireStaff },
    async (request, reply) => {
      const provider = z
        .enum(providers)
        .parse((request.params as { provider: string }).provider);
      const body = z
        .object({
          enabled: z.boolean(),
          settings: z.record(z.unknown()).default({}),
          credentials: z.record(z.string()).optional(),
        })
        .parse(request.body);
      const existing = await integrationRepository.find(provider);
      const existingSettings = (
        existing?.settings &&
        typeof existing.settings === "object" &&
        !Array.isArray(existing.settings)
          ? existing.settings
          : {}
      ) as Record<string, unknown>;
      const settings = { ...existingSettings, ...body.settings };
      const credentials =
        body.credentials ??
        (existing?.credentialsEncrypted
          ? decryptSecret<Record<string, string>>(
              existing.credentialsEncrypted,
              encryptionKey,
            )
          : {});
      if (provider === "whatsapp" && body.enabled) {
        const destinations = parseDestinations(credentials);
        const validated = Array.isArray(settings.validatedDestinations)
          ? settings.validatedDestinations.filter(
              (value): value is string => typeof value === "string",
            )
          : [];
        if (
          !destinations.length ||
          !destinations.every((destination) => validated.includes(destination))
        )
          return reply
            .code(400)
            .send({
              error: "WHATSAPP_NOT_VALIDATED",
              message:
                "Salve os destinos, valide grupos/canais e só então ative o WhatsApp.",
            });
      }
      const credentialsEncrypted = body.credentials
        ? encryptSecret(body.credentials, encryptionKey)
          : (existing?.credentialsEncrypted ?? null);
      if (provider === "smtp" && body.enabled) {
        const smtpSettings = z
          .object({
            host: z.string().min(1),
            port: z.number().int().min(1).max(65_535).default(587),
            from: z.string().email(),
          })
          .safeParse(settings);
        if (!smtpSettings.success)
          return reply.code(400).send({
            error: "SMTP_NOT_CONFIGURED",
            message:
              "Para ativar SMTP, informe host, port e from nas configurações.",
          });
      }
      const [integration] = await integrationRepository.save({
        provider,
        enabled: body.enabled,
        settings,
        credentialsEncrypted,
      });
      const { credentialsEncrypted: _secret, ...safe } = integration;
      return { data: safe };
    },
  );
  app.post(
    "/admin/integrations/whatsapp/validate",
    { preHandler: requireStaff },
    async (_request, reply) => {
      const integration = await integrationRepository.find("whatsapp");
      if (!integration?.credentialsEncrypted)
        return reply
          .code(400)
          .send({
            error: "WHATSAPP_NOT_CONFIGURED",
            message:
              "Salve o bridge e os destinos do WhatsApp antes de validar.",
          });
      const credentials = decryptSecret<Record<string, string>>(
        integration.credentialsEncrypted,
        encryptionKey,
      );
      const destinations = [
        ...new Set(
          (credentials.destinations ?? credentials.destination ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ];
      if (!credentials.bridgeUrl || !destinations.length)
        return reply
          .code(400)
          .send({
            error: "WHATSAPP_NOT_CONFIGURED",
            message: "Configure bridgeUrl e ao menos um grupo ou canal.",
          });
      let result: {
        data?: Array<{
          destination: string;
          ok: boolean;
          name?: string;
          isGroup?: boolean;
          message?: string;
        }>;
      };
      try {
        const response = await fetch(
          `${credentials.bridgeUrl.replace(/\/$/, "")}/validate-destinations`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(credentials.bridgeToken
                ? { authorization: `Bearer ${credentials.bridgeToken}` }
                : {}),
            },
            body: JSON.stringify({ destinations }),
            signal: AbortSignal.timeout(15_000),
          },
        );
        result = await response.json().catch(() => ({}));
        if (!response.ok)
          return reply
            .code(400)
            .send({
              error: "WHATSAPP_VALIDATION_FAILED",
              message:
                "O bridge não conseguiu validar os destinos. Verifique QR, número e permissões.",
            });
      } catch {
        return reply
          .code(400)
          .send({
            error: "WHATSAPP_VALIDATION_FAILED",
            message: "Não foi possível alcançar o bridge do WhatsApp.",
          });
      }
      const validatedDestinations = (result.data ?? [])
        .filter((item) => item.ok)
        .map((item) => item.destination);
      const settings = {
        ...((integration.settings &&
        typeof integration.settings === "object" &&
        !Array.isArray(integration.settings)
          ? integration.settings
          : {}) as Record<string, unknown>),
        validatedDestinations,
        validatedAt: new Date().toISOString(),
      };
      await integrationRepository.recordValidation(integration.id, settings);
      return {
        data: result.data ?? [],
        allValid: destinations.every((destination) =>
          validatedDestinations.includes(destination),
        ),
      };
    },
  );
};

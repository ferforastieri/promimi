import type { FastifyInstance } from "fastify";
import { authorizeBridge } from "./auth.js";
import type { WhatsappBridge } from "./bridge.js";

export async function registerBridgeRoutes(
  app: FastifyInstance,
  bridge: WhatsappBridge,
  token: string | undefined,
) {
  app.get("/status", async () => ({ state: bridge.status() }));
  app.get("/qr", async (_request, reply) =>
    bridge.status() === "QR_REQUIRED"
      ? { qrDataUrl: bridge.qr() }
      : reply
          .code(409)
          .send({
            message: "QR não está disponível neste momento.",
            state: bridge.status(),
          }),
  );
  app.post("/messages", async (request, reply) => {
    if (!authorizeBridge(request, token))
      return reply.code(401).send({ message: "Não autorizado." });
    if (bridge.status() !== "READY")
      return reply
        .code(503)
        .send({
          message: "WhatsApp não está conectado; envios foram pausados.",
        });
    const body = request.body as { destination?: string; text?: string };
    if (!body.destination || !body.text)
      return reply
        .code(400)
        .send({ message: "destination e text são obrigatórios." });
    return { id: await bridge.send(body.destination, body.text) };
  });
  app.post("/validate-destinations", async (request, reply) => {
    if (!authorizeBridge(request, token))
      return reply.code(401).send({ message: "Não autorizado." });
    if (bridge.status() !== "READY")
      return reply
        .code(503)
        .send({
          message:
            "WhatsApp não está conectado; reconecte e tente validar novamente.",
        });
    const body = request.body as { destinations?: string[] };
    const destinations = Array.isArray(body.destinations)
      ? [
          ...new Set(
            body.destinations
              .map((destination) => destination.trim())
              .filter(Boolean),
          ),
        ]
      : [];
    if (!destinations.length)
      return reply
        .code(400)
        .send({ message: "Informe ao menos um grupo ou canal administrado." });
    return { data: await bridge.validate(destinations) };
  });
}

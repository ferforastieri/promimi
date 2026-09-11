import Fastify from "fastify";
import { WhatsappBridge } from "./session/index.js";
import { registerBridgeRoutes } from "./routes.js";

export async function startWhatsappServer() {
  const app = Fastify({ logger: true, bodyLimit: 64 * 1024 });
  const bridge = new WhatsappBridge(app.log);
  await bridge.initialize();
  await registerBridgeRoutes(app, bridge, process.env.WHATSAPP_BRIDGE_TOKEN);
  await app.listen({ host: "0.0.0.0", port: Number(process.env.WHATSAPP_PORT ?? 3100) });
}

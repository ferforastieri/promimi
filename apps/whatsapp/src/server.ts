import Fastify from "fastify";
import { loadWhatsappConfig } from "@promimi/infrastructure/config/whatsapp";
import { WhatsappBridge } from "./session/index.js";
import { registerBridgeRoutes } from "./routes.js";

export async function startWhatsappServer() {
  const config = loadWhatsappConfig();
  const app = Fastify({ logger: true, bodyLimit: 64 * 1024 });
  const bridge = new WhatsappBridge(app.log, config.WHATSAPP_SESSION_PATH);
  await bridge.initialize();
  await registerBridgeRoutes(app, bridge, config.WHATSAPP_BRIDGE_TOKEN);
  await app.listen({ host: "0.0.0.0", port: config.WHATSAPP_PORT });
}

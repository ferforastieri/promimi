import Fastify from "fastify";
import QRCode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";

const app = Fastify({ logger: true });
const token = process.env.WHATSAPP_BRIDGE_TOKEN;
let state: "STARTING" | "QR_REQUIRED" | "READY" | "DISCONNECTED" = "STARTING";
let qrDataUrl: string | null = null;
const client = new Client({ authStrategy: new LocalAuth({ dataPath: process.env.WHATSAPP_SESSION_PATH ?? "/data/session" }), puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] } });
client.on("qr", async (qr) => { state = "QR_REQUIRED"; qrDataUrl = await QRCode.toDataURL(qr); });
client.on("ready", () => { state = "READY"; qrDataUrl = null; app.log.info("WhatsApp connected"); });
client.on("disconnected", (reason) => { state = "DISCONNECTED"; app.log.warn({ reason }, "WhatsApp disconnected; worker will pause this destination"); });
await client.initialize();

app.get("/status", async () => ({ state }));
app.get("/qr", async (_request, reply) => state === "QR_REQUIRED" ? { qrDataUrl } : reply.code(409).send({ message: "QR não está disponível neste momento.", state }));
app.post("/messages", async (request, reply) => {
  if (!token || request.headers.authorization !== `Bearer ${token}`) return reply.code(401).send({ message: "Não autorizado." });
  if (state !== "READY") return reply.code(503).send({ message: "WhatsApp não está conectado; envios foram pausados." });
  const body = request.body as { destination?: string; text?: string };
  if (!body.destination || !body.text) return reply.code(400).send({ message: "destination e text são obrigatórios." });
  const message = await client.sendMessage(body.destination, body.text);
  return { id: message.id.id };
});
app.post("/validate-destinations", async (request, reply) => {
  if (!token || request.headers.authorization !== `Bearer ${token}`) return reply.code(401).send({ message: "Não autorizado." });
  if (state !== "READY") return reply.code(503).send({ message: "WhatsApp não está conectado; reconecte e tente validar novamente." });
  const body = request.body as { destinations?: string[] };
  const destinations = Array.isArray(body.destinations) ? [...new Set(body.destinations.map((destination) => destination.trim()).filter(Boolean))] : [];
  if (!destinations.length) return reply.code(400).send({ message: "Informe ao menos um grupo ou canal administrado." });
  const data = await Promise.all(destinations.map(async (destination) => {
    try {
      const chat = await client.getChatById(destination);
      return { destination, ok: true, name: chat.name, isGroup: chat.isGroup };
    } catch {
      return { destination, ok: false, message: "Destino não encontrado ou não administrado por este número." };
    }
  }));
  return { data };
});
await app.listen({ host: "0.0.0.0", port: Number(process.env.WHATSAPP_PORT ?? 3100) });

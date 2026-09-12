import QRCode from "qrcode";
import { Client, LocalAuth } from "whatsapp-web.js";

export type BridgeState = "STARTING" | "QR_REQUIRED" | "READY" | "DISCONNECTED";

/** Isolates WhatsApp Web state and session storage from the HTTP surface. */
export class WhatsappBridge {
  private state: BridgeState = "STARTING";
  private qrDataUrl: string | null = null;
  private readonly client: Client;
  constructor(
    private readonly log: {
      info: (value: unknown) => void;
      warn: (value: unknown) => void;
    },
    sessionPath: string,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: sessionPath }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });
    this.client.on("qr", async (qr) => {
      this.state = "QR_REQUIRED";
      this.qrDataUrl = await QRCode.toDataURL(qr);
    });
    this.client.on("ready", () => {
      this.state = "READY";
      this.qrDataUrl = null;
      this.log.info("WhatsApp connected");
    });
    this.client.on("disconnected", (reason) => {
      this.state = "DISCONNECTED";
      this.log.warn({
        reason,
        message: "WhatsApp disconnected; worker will pause this destination",
      });
    });
  }
  initialize() {
    return this.client.initialize();
  }
  status() {
    return this.state;
  }
  qr() {
    return this.qrDataUrl;
  }
  async send(destination: string, text: string) {
    const message = await this.client.sendMessage(destination, text);
    return message.id.id;
  }
  async validate(destinations: string[]) {
    return Promise.all(
      destinations.map(async (destination) => {
        try {
          const chat = await this.client.getChatById(destination);
          return {
            destination,
            ok: true,
            name: chat.name,
            isGroup: chat.isGroup,
          };
        } catch {
          return {
            destination,
            ok: false,
            message:
              "Destino não encontrado ou não administrado por este número.",
          };
        }
      }),
    );
  }
}

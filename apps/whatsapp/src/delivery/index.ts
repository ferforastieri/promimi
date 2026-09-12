import type { WhatsappBridge } from "../bridge.js";
export const deliverWhatsappMessage = (
  bridge: WhatsappBridge,
  destination: string,
  text: string,
) => bridge.send(destination, text);

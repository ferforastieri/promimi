import type { WhatsappBridge } from "../bridge.js";
export const validateWhatsappDestinations = (bridge: WhatsappBridge, destinations: string[]) => bridge.validate(destinations);

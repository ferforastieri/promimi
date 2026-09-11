import { calculateDiscount, shouldRequestPublication } from "../domain/offer-policy.js";
import { catalogRepository } from "../infrastructure/repository.js";
import type { UpdateOfferCommand } from "./offer-commands.js";

export async function updateOffer(id: string, command: UpdateOfferCommand) {
  const destinations = command.status && shouldRequestPublication(command.status) ? await catalogRepository.enabledPublicationDestinations() : [];
  const discountPercent = command.currentPrice !== undefined ? calculateDiscount(command.currentPrice, command.originalPrice) : undefined;
  return catalogRepository.updateOffer(id, { ...command, discountPercent, destinations });
}

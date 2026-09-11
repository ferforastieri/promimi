import { calculateDiscount, shouldRequestPublication } from "../domain/offer-policy.js";
import { slugify } from "../domain/offer.js";
import { catalogRepository } from "../infrastructure/repository.js";
import type { CreateOfferCommand } from "./offer-commands.js";

export async function createOffer(command: CreateOfferCommand) {
  const status = command.status ?? "DRAFT";
  const destinations = shouldRequestPublication(status) ? await catalogRepository.enabledPublicationDestinations() : [];
  return catalogRepository.createOffer({ ...command, status, slug: `${slugify(command.title)}-${crypto.randomUUID().slice(0, 8)}`, discountPercent: calculateDiscount(command.currentPrice, command.originalPrice), destinations });
}

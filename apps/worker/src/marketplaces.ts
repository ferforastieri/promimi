import { z } from "zod";

const rawOffer = z.object({
  title: z.string().min(8).max(240),
  url: z.string().url(),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  couponCode: z.string().max(64).optional(),
  category: z.string().min(2).max(80).optional(),
  expiresAt: z.coerce.date().optional(),
});
export type CandidateOffer = z.infer<typeof rawOffer> & {
  provider: "amazon" | "mercado-livre" | "shopee";
};
export type RoutineFilters = {
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  categories?: string[];
};

export function candidateDiscount(
  candidate: Pick<CandidateOffer, "price" | "originalPrice">,
) {
  return candidate.originalPrice && candidate.originalPrice > candidate.price
    ? Math.round((1 - candidate.price / candidate.originalPrice) * 100)
    : null;
}

export function normalizeCandidates(
  provider: CandidateOffer["provider"],
  entries: unknown[],
  knownUrls = new Set<string>(),
  now = new Date(),
) {
  const accepted: CandidateOffer[] = [];
  let duplicates = 0;
  let rejected = 0;
  for (const entry of entries) {
    const parsed = rawOffer.safeParse(entry);
    if (
      !parsed.success ||
      (parsed.data.expiresAt && parsed.data.expiresAt <= now)
    ) {
      rejected++;
      continue;
    }
    if (knownUrls.has(parsed.data.url)) {
      duplicates++;
      continue;
    }
    knownUrls.add(parsed.data.url);
    accepted.push({ ...parsed.data, provider });
  }
  return { accepted, duplicates, rejected };
}

export function isEligible(candidate: CandidateOffer, filters: RoutineFilters) {
  if (filters.minPrice && candidate.price < filters.minPrice) return false;
  if (filters.maxPrice && candidate.price > filters.maxPrice) return false;
  const discount = candidateDiscount(candidate) ?? 0;
  if (filters.minDiscount && discount < filters.minDiscount) return false;
  if (
    filters.keywords?.length &&
    !filters.keywords.some((keyword) =>
      candidate.title.toLowerCase().includes(keyword.toLowerCase()),
    )
  )
    return false;
  if (
    filters.categories?.length &&
    (!candidate.category ||
      !filters.categories.some(
        (category) =>
          category.toLowerCase() === candidate.category!.toLowerCase(),
      ))
  )
    return false;
  return true;
}

/**
 * A provider is only polled when a feed endpoint is configured in its integration.
 * Official affiliate APIs can be normalized to this shape without changing routines.
 */
export async function collectFeed(
  provider: CandidateOffer["provider"],
  settings: unknown,
): Promise<CandidateOffer[]> {
  const feedUrl =
    typeof settings === "object" &&
    settings &&
    "feedUrl" in settings &&
    typeof settings.feedUrl === "string"
      ? settings.feedUrl
      : undefined;
  if (!feedUrl) return [];
  const response = await fetch(feedUrl, {
    signal: AbortSignal.timeout(20_000),
    headers: { accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`${provider} retornou HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  const entries = Array.isArray(payload)
    ? payload
    : typeof payload === "object" &&
        payload &&
        "offers" in payload &&
        Array.isArray(payload.offers)
      ? payload.offers
      : [];
  return normalizeCandidates(provider, entries).accepted;
}

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

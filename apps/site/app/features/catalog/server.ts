import type { Offer } from "@promimi/contracts";

/** Server-side catalog read model. Browser mutations stay in the feature clients. */
export async function loadCatalogOffers(search = ""): Promise<Offer[] | null> {
  try { const response = await fetch(`${process.env.API_URL ?? "http://localhost:3001"}/api/v1/offers${search}`, { signal: AbortSignal.timeout(1300) }); return response.ok ? ((await response.json()) as { data: Offer[] }).data : null; } catch { return null; }
}

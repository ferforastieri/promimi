import type { Offer } from "./types";

/** Server-side catalog read model. Browser mutations stay in the feature clients. */
export async function loadCatalogOffers(
  origin: string,
  search = "",
): Promise<Offer[] | null> {
  try {
    const response = await fetch(`${origin}/api/v1/offers${search}`, {
      signal: AbortSignal.timeout(1300),
    });
    return response.ok
      ? ((await response.json()) as { data: Offer[] }).data
      : null;
  } catch {
    return null;
  }
}

export const apiOffers = async (origin: string, search = "") =>
  (await loadCatalogOffers(origin, search)) ?? [];
export const brl = (number: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number,
  );

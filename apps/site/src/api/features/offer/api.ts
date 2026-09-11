import { apiRequest } from "../../client";
export const offerApi = { detail: (slug: string) => apiRequest(`/offers/${slug}`), click: (id: string, source = "site") => apiRequest(`/offers/${id}/click?source=${encodeURIComponent(source)}`, { method: "POST" }) };

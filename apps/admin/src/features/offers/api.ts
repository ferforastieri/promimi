import { apiRequest } from "../../lib/api-client";
export const offersAdminApi = { list: () => apiRequest("/admin/offers"), create: (body: unknown) => apiRequest("/admin/offers", { method: "POST", body: JSON.stringify(body) }), update: (id: string, body: unknown) => apiRequest(`/admin/offers/${id}`, { method: "PATCH", body: JSON.stringify(body) }) };

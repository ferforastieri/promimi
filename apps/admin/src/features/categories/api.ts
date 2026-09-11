import { apiRequest } from "../../lib/api-client";
export const categoriesAdminApi = { list: () => apiRequest("/admin/categories"), create: (body: unknown) => apiRequest("/admin/categories", { method: "POST", body: JSON.stringify(body) }) };

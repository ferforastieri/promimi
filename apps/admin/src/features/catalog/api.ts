import { apiRequest } from "../../lib/api-client";
export const catalogAdminApi = { offers: () => apiRequest("/admin/offers"), categories: () => apiRequest("/admin/categories"), stores: () => apiRequest("/stores") };

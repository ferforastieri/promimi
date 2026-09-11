import { apiRequest } from "../../lib/api-client";
export const publishingAdminApi = { list: () => apiRequest("/admin/publications") };

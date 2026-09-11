import { apiRequest } from "../../lib/api-client";
export const usersAdminApi = { list: () => apiRequest("/admin/users"), updateRole: (id: string, role: string) => apiRequest(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }) };

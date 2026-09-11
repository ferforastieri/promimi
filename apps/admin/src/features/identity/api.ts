import { apiRequest } from "../../lib/api-client";
export const identityAdminApi = { me: () => apiRequest("/me"), users: () => apiRequest("/admin/users"), logout: () => apiRequest("/auth/logout", { method: "POST" }) };

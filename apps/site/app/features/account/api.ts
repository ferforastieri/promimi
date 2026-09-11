import { apiRequest } from "../../lib/api-client";

export const accountApi = {
  profile: () => apiRequest("/me"), favorites: () => apiRequest("/me/favorites"), remove: () => apiRequest("/me", { method: "DELETE" }),
  login: (body: Record<string, unknown>) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: Record<string, unknown>) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" })
};

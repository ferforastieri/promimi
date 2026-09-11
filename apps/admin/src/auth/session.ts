import { apiRequest } from "../lib/api-client";
export const adminSession = { current: () => apiRequest("/me"), logout: () => apiRequest("/auth/logout", { method: "POST" }) };

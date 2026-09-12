import { apiRequest } from "../../client";

export const accountApi = {
  profile: () => apiRequest("/me"),
  favorites: () => apiRequest("/me/favorites"),
  remove: () => apiRequest("/me", { method: "DELETE" }),
  login: (body: Record<string, unknown>) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: Record<string, unknown>) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  requestPasswordReset: (email: string) =>
    apiRequest("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string | null, password: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  verifyEmail: (token: string) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

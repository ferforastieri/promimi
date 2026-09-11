const apiOrigin = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);
export const apiBase = `${apiOrigin}/api/v1`;

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

/** All authenticated admin requests rely on the HttpOnly session cookie. */
export async function apiRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, headers, credentials: "include" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(payload.message ?? "Não foi possível acessar o painel.", response.status);
  return payload as T;
}

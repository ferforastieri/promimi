export type OfferStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "PAUSED";
export type UserRole = "ADMIN" | "EDITOR" | "VISITOR";
export interface ApiList<T> { data: T[]; total: number; }
export interface ApiError { error: string; message: string; }
export interface SessionUser { id: string; email: string; name?: string | null; role: UserRole; }

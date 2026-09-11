import { z } from "zod";

export const offerInputSchema = z.object({ title: z.string().min(8).max(240), description: z.string().max(5000).optional(), storeId: z.string().uuid(), categoryId: z.string().uuid().optional().nullable(), currentPrice: z.coerce.number().positive(), originalPrice: z.coerce.number().positive().optional().nullable(), couponCode: z.string().max(64).optional().nullable(), affiliateUrl: z.string().url(), imageUrl: z.string().url().optional().nullable(), expiresAt: z.coerce.date().optional().nullable(), status: z.enum(["DRAFT", "PUBLISHED", "EXPIRED", "PAUSED"]).optional() });
export const offerSearchSchema = z.object({ q: z.string().optional(), store: z.string().optional(), min: z.string().optional(), max: z.string().optional(), category: z.string().optional() });
export const categoryCreateSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional().nullable(), isActive: z.boolean().default(true) });
export const categoryUpdateSchema = categoryCreateSchema.partial();

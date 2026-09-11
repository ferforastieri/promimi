import type { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { and, desc, eq, gte, ilike, isNull, lte, sql } from "drizzle-orm";
import { authTokens, categories, clicks, comments, db, favorites, integrations, offers, publications, reports, routineExecutions, routines, stores, users } from "@promimi/database";
import { requireStaff, requireUser } from "./auth.js";
import { z } from "zod";
import { createOpaqueToken, encryptSecret, hashToken } from "./crypto.js";
import { decryptSecret } from "./crypto.js";
import { deliverMail, passwordResetMail, verificationMail } from "./mailer.js";
import { authenticator } from "otplib";
import { socialCardSvg } from "./social-card.js";
import { clearSession, establishSession } from "./modules/identity/session.js";

const offerInput = z.object({ title: z.string().min(8).max(240), description: z.string().max(5000).optional(), storeId: z.string().uuid(), categoryId: z.string().uuid().optional().nullable(), currentPrice: z.coerce.number().positive(), originalPrice: z.coerce.number().positive().optional().nullable(), couponCode: z.string().max(64).optional().nullable(), affiliateUrl: z.string().url(), imageUrl: z.string().url().optional().nullable(), expiresAt: z.coerce.date().optional().nullable(), status: z.enum(["DRAFT", "PUBLISHED", "EXPIRED", "PAUSED"]).optional() });
const slugify = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const mapOffer = (row: typeof offers.$inferSelect & { store: typeof stores.$inferSelect; category: typeof categories.$inferSelect | null }) => ({ ...row, currentPrice: Number(row.currentPrice), originalPrice: row.originalPrice ? Number(row.originalPrice) : null, store: { id: row.store.id, name: row.store.name, slug: row.store.slug, logoUrl: row.store.logoUrl }, category: row.category ? { name: row.category.name, slug: row.category.slug } : null });
const publicUrl = () => process.env.APP_URL ?? "http://localhost:3000";
const newToken = async (userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") => {
  const token = createOpaqueToken();
  await db.insert(authTokens).values({ userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 1000 * 60 * 60) });
  return token;
};

export async function routes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    try { await db.execute(sql`select 1`); return { ok: true, now: new Date().toISOString() }; }
    catch { return reply.code(503).send({ ok: false, message: "Banco de dados indisponível." }); }
  });
  app.get("/categories", async () => ({ data: await db.select().from(categories).where(eq(categories.isActive, true)) }));
  app.get("/stores", async () => ({ data: await db.select().from(stores).where(eq(stores.isActive, true)) }));

  app.get("/offers", async (request) => {
    const q = request.query as { q?: string; store?: string; min?: string; max?: string; category?: string };
    const filters = [eq(offers.status, "PUBLISHED")];
    if (q.q) filters.push(ilike(offers.title, `%${q.q}%`));
    if (q.min) filters.push(gte(offers.currentPrice, q.min));
    if (q.max) filters.push(lte(offers.currentPrice, q.max));
    const rows = await db.query.offers.findMany({ where: and(...filters), with: { store: true, category: true }, orderBy: [desc(offers.publishedAt)] });
    return { data: rows.filter((item) => (!q.store || item.store.slug === q.store) && (!q.category || item.category?.slug === q.category)).map(mapOffer), total: rows.length };
  });
  app.get("/offers/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const item = await db.query.offers.findFirst({ where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")), with: { store: true, category: true } });
    if (!item) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return mapOffer(item);
  });
  app.get("/offers/:slug/card.svg", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const item = await db.query.offers.findFirst({ where: and(eq(offers.slug, slug), eq(offers.status, "PUBLISHED")), with: { store: true } });
    if (!item) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    return reply.type("image/svg+xml; charset=utf-8").header("cache-control", "public, max-age=300").send(socialCardSvg(item));
  });
  app.get("/offers/:id/comments", async (request) => {
    const { id } = request.params as { id: string };
    const rows = await db.query.comments.findMany({ where: and(eq(comments.offerId, id), eq(comments.isHidden, false)), with: { user: true }, orderBy: [desc(comments.createdAt)] });
    return { data: rows.map((comment) => ({ id: comment.id, body: comment.body, createdAt: comment.createdAt, author: comment.user.name ?? "Visitante Promimi" })) };
  });
  app.post("/offers/:id/click", async (request, reply) => {
    const { id } = request.params as { id: string };
    const source = (request.query as { source?: string }).source ?? "direct";
    const [offer] = await db.select({ url: offers.affiliateUrl }).from(offers).where(eq(offers.id, id));
    if (!offer) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    await db.insert(clicks).values({ offerId: id, source });
    return { url: offer.url };
  });
  app.get("/offers/:id/go", async (request, reply) => {
    const { id } = request.params as { id: string };
    const source = (request.query as { source?: string }).source ?? "direct";
    const [offer] = await db.select({ url: offers.affiliateUrl }).from(offers).where(and(eq(offers.id, id), eq(offers.status, "PUBLISHED")));
    if (!offer) return reply.code(404).send({ error: "NOT_FOUND", message: "Oferta não encontrada." });
    await db.insert(clicks).values({ offerId: id, source });
    return reply.redirect(offer.url, 302);
  });

  app.post("/auth/register", { config: { rateLimit: { max: 3, timeWindow: "1 hour" } } }, async (request, reply) => {
    const input = z.object({ email: z.string().email(), password: z.string().min(10), name: z.string().min(2).max(120).optional() }).parse(request.body);
    const exists = await db.query.users.findFirst({ where: eq(users.email, input.email.toLowerCase()) });
    if (exists) return reply.code(409).send({ error: "EMAIL_IN_USE", message: "Este e-mail já está cadastrado." });
    const [user] = await db.insert(users).values({ email: input.email.toLowerCase(), passwordHash: await argon2.hash(input.password), name: input.name }).returning();
    const token = await newToken(user.id, "EMAIL_VERIFICATION");
    await deliverMail(verificationMail(user.email, `${publicUrl()}/verificar-email?token=${encodeURIComponent(token)}`));
    establishSession(app, reply, { id: user.id, role: user.role, email: user.email });
    return reply.code(201).send({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, verificationPending: true });
  });
  app.post("/auth/verify-email", { config: { rateLimit: { max: 10, timeWindow: "1 hour" } } }, async (request, reply) => {
    const { token } = z.object({ token: z.string().min(20) }).parse(request.body);
    const record = await db.query.authTokens.findFirst({ where: and(eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.purpose, "EMAIL_VERIFICATION"), isNull(authTokens.usedAt)) });
    if (!record || record.expiresAt < new Date()) return reply.code(400).send({ error: "INVALID_TOKEN", message: "Este link expirou ou já foi utilizado." });
    await db.transaction(async (tx) => { await tx.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, record.userId)); await tx.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, record.id)); });
    return { ok: true };
  });
  app.post("/auth/request-password-reset", { config: { rateLimit: { max: 3, timeWindow: "1 hour" } } }, async (request) => {
    const { email } = z.object({ email: z.string().email() }).parse(request.body);
    const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
    if (user) { const token = await newToken(user.id, "PASSWORD_RESET"); await deliverMail(passwordResetMail(user.email, `${publicUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`)); }
    return { ok: true }; // Same response prevents account enumeration.
  });
  app.post("/auth/reset-password", { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } }, async (request, reply) => {
    const body = z.object({ token: z.string().min(20), password: z.string().min(10) }).parse(request.body);
    const record = await db.query.authTokens.findFirst({ where: and(eq(authTokens.tokenHash, hashToken(body.token)), eq(authTokens.purpose, "PASSWORD_RESET"), isNull(authTokens.usedAt)) });
    if (!record || record.expiresAt < new Date()) return reply.code(400).send({ error: "INVALID_TOKEN", message: "Este link expirou ou já foi utilizado." });
    await db.transaction(async (tx) => { await tx.update(users).set({ passwordHash: await argon2.hash(body.password), updatedAt: new Date() }).where(eq(users.id, record.userId)); await tx.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, record.id)); });
    return { ok: true };
  });
  app.post("/auth/login", { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } }, async (request, reply) => {
    const input = z.object({ email: z.string().email(), password: z.string().min(1), totpCode: z.string().regex(/^\d{6}$/).optional() }).parse(request.body);
    const user = await db.query.users.findFirst({ where: eq(users.email, input.email.toLowerCase()) });
    if (!user || user.deletedAt || !(await argon2.verify(user.passwordHash, input.password))) return reply.code(401).send({ error: "INVALID_CREDENTIALS", message: "E-mail ou senha incorretos." });
    if (user.role === "ADMIN" && user.totpEnabled && user.totpSecretEncrypted) {
      const secret = decryptSecret<string>(user.totpSecretEncrypted, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden");
      if (!input.totpCode || !authenticator.verify({ token: input.totpCode, secret })) return reply.code(401).send({ error: "TOTP_REQUIRED", message: "Informe o código do seu autenticador." });
    }
    establishSession(app, reply, { id: user.id, role: user.role, email: user.email });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });
  app.post("/auth/logout", { preHandler: requireUser }, async (_request, reply) => {
    clearSession(reply);
    return { ok: true };
  });

  app.post("/offers/:id/favorite", { preHandler: requireUser }, async (request) => { const { id } = request.params as { id: string }; await db.insert(favorites).values({ userId: request.user.id, offerId: id }).onConflictDoNothing(); return { ok: true }; });
  app.post("/offers/:id/comments", { preHandler: requireUser, config: { rateLimit: { max: 5, timeWindow: "1 minute" } } }, async (request) => { const { id } = request.params as { id: string }; const body = z.object({ body: z.string().trim().min(2).max(1500) }).parse(request.body); const [comment] = await db.insert(comments).values({ offerId: id, userId: request.user.id, body: body.body.replace(/<[^>]*>/g, "") }).returning(); return { data: comment }; });
  app.post("/comments/:id/report", { preHandler: requireUser }, async (request) => { const { id } = request.params as { id: string }; const body = z.object({ reason: z.string().min(3).max(300) }).parse(request.body); await db.insert(reports).values({ commentId: id, reporterId: request.user.id, reason: body.reason }); return { ok: true }; });
  app.get("/me", { preHandler: requireUser }, async (request, reply) => { const user = await db.query.users.findFirst({ where: eq(users.id, request.user.id) }); if (!user || user.deletedAt) return reply.code(404).send({ error: "NOT_FOUND", message: "Conta não encontrada." }); return { data: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerifiedAt: user.emailVerifiedAt } }; });
  app.get("/me/favorites", { preHandler: requireUser }, async (request) => ({ data: await db.query.favorites.findMany({ where: eq(favorites.userId, request.user.id), with: { offer: { with: { store: true, category: true } } }, orderBy: [desc(favorites.createdAt)] }) }));
  app.delete("/me", { preHandler: requireUser, config: { rateLimit: { max: 3, timeWindow: "1 hour" } } }, async (request, reply) => { const anonymized = `deleted+${request.user.id}@deleted.promimi.invalid`; await db.update(users).set({ email: anonymized, name: null, passwordHash: await argon2.hash(createOpaqueToken()), totpSecretEncrypted: null, totpEnabled: false, deletedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, request.user.id)); clearSession(reply); return { ok: true }; });

  app.get("/admin/offers", { preHandler: requireStaff }, async () => ({ data: (await db.query.offers.findMany({ with: { store: true, category: true }, orderBy: [desc(offers.updatedAt)] })).map(mapOffer) }));
  app.post("/admin/totp/setup", { preHandler: requireStaff }, async (request, reply) => {
    if (request.user.role !== "ADMIN") return reply.code(403).send({ error: "FORBIDDEN", message: "Apenas administradores configuram TOTP." });
    const secret = authenticator.generateSecret();
    const encrypted = encryptSecret(secret, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden");
    await db.update(users).set({ totpSecretEncrypted: encrypted, updatedAt: new Date() }).where(eq(users.id, request.user.id));
    return { secret, otpauthUrl: authenticator.keyuri(request.user.email, "Promimi", secret), message: "Confirme o código de seis dígitos para concluir a ativação." };
  });
  app.post("/admin/totp/confirm", { preHandler: requireStaff }, async (request, reply) => {
    if (request.user.role !== "ADMIN") return reply.code(403).send({ error: "FORBIDDEN", message: "Apenas administradores configuram TOTP." });
    const { code } = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(request.body);
    const user = await db.query.users.findFirst({ where: eq(users.id, request.user.id) });
    if (!user?.totpSecretEncrypted) return reply.code(400).send({ error: "TOTP_NOT_STARTED", message: "Inicie a configuração antes de confirmar." });
    const secret = decryptSecret<string>(user.totpSecretEncrypted, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden");
    if (!authenticator.verify({ token: code, secret })) return reply.code(400).send({ error: "INVALID_TOTP", message: "Código inválido." });
    await db.update(users).set({ totpEnabled: true, updatedAt: new Date() }).where(eq(users.id, request.user.id));
    return { ok: true };
  });
  app.post("/admin/offers", { preHandler: requireStaff }, async (request, reply) => {
    const input = offerInput.parse(request.body); const status = input.status ?? "DRAFT"; const discount = input.originalPrice && input.originalPrice > input.currentPrice ? Math.round((1 - input.currentPrice / input.originalPrice) * 100) : null;
    const baseSlug = slugify(input.title); const suffix = Math.random().toString(36).slice(2, 7); const [offer] = await db.insert(offers).values({ ...input, slug: `${baseSlug}-${suffix}`, currentPrice: String(input.currentPrice), originalPrice: input.originalPrice ? String(input.originalPrice) : null, discountPercent: discount, status, createdById: request.user.id, publishedAt: status === "PUBLISHED" ? new Date() : null, verifiedAt: new Date() }).returning();
    if (status === "PUBLISHED") { const enabled = await db.select({ provider: integrations.provider }).from(integrations).where(eq(integrations.enabled, true)); const destinations = enabled.filter((integration) => ["telegram", "whatsapp", "instagram", "facebook", "x"].includes(integration.provider)); if (destinations.length) await db.insert(publications).values(destinations.map((integration) => ({ offerId: offer.id, destination: integration.provider, status: "PENDING" as const }))); }
    return reply.code(201).send({ data: offer });
  });
  app.patch("/admin/offers/:id", { preHandler: requireStaff }, async (request) => { const { id } = request.params as { id: string }; const input = offerInput.partial().parse(request.body); const [offer] = await db.update(offers).set({ ...input, currentPrice: input.currentPrice ? String(input.currentPrice) : undefined, originalPrice: input.originalPrice === null ? null : input.originalPrice === undefined ? undefined : String(input.originalPrice), publishedAt: input.status === "PUBLISHED" ? new Date() : undefined, updatedAt: new Date() }).where(eq(offers.id, id)).returning(); if (offer && input.status === "PUBLISHED") { const enabled = await db.select({ provider: integrations.provider }).from(integrations).where(eq(integrations.enabled, true)); const existing = await db.select({ destination: publications.destination }).from(publications).where(eq(publications.offerId, offer.id)); const seen = new Set(existing.map((item) => item.destination)); const destinations = enabled.filter((integration) => ["telegram", "whatsapp", "instagram", "facebook", "x"].includes(integration.provider) && !seen.has(integration.provider)); if (destinations.length) await db.insert(publications).values(destinations.map((integration) => ({ offerId: offer.id, destination: integration.provider, status: "PENDING" as const }))); } return { data: offer }; });
  app.get("/admin/comments", { preHandler: requireStaff }, async () => ({ data: await db.query.comments.findMany({ with: { user: true, offer: true }, orderBy: [desc(comments.createdAt)] }) }));
  app.patch("/admin/comments/:id", { preHandler: requireStaff }, async (request) => { const { id } = request.params as { id: string }; const { isHidden } = z.object({ isHidden: z.boolean() }).parse(request.body); const [comment] = await db.update(comments).set({ isHidden, updatedAt: new Date() }).where(eq(comments.id, id)).returning(); return { data: comment }; });
  app.get("/admin/users", { preHandler: requireStaff }, async () => ({ data: await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt }).from(users).where(isNull(users.deletedAt)).orderBy(desc(users.createdAt)) }));
  app.patch("/admin/users/:id", { preHandler: requireStaff }, async (request, reply) => {
    if (request.user.role !== "ADMIN") return reply.code(403).send({ error: "FORBIDDEN", message: "Apenas administradores alteram papéis." });
    const { id } = request.params as { id: string };
    const { role: nextRole } = z.object({ role: z.enum(["ADMIN", "EDITOR", "VISITOR"]) }).parse(request.body);
    if (id === request.user.id && nextRole !== "ADMIN") return reply.code(400).send({ error: "LAST_ADMIN", message: "Não remova seu próprio acesso administrativo." });
    const [user] = await db.update(users).set({ role: nextRole, updatedAt: new Date() }).where(and(eq(users.id, id), isNull(users.deletedAt))).returning({ id: users.id, email: users.email, name: users.name, role: users.role });
    if (!user) return reply.code(404).send({ error: "NOT_FOUND", message: "Usuário não encontrado." });
    return { data: user };
  });
  app.get("/admin/categories", { preHandler: requireStaff }, async () => ({ data: await db.select().from(categories).orderBy(categories.name) }));
  app.post("/admin/categories", { preHandler: requireStaff }, async (request, reply) => {
    const input = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional().nullable(), isActive: z.boolean().default(true) }).parse(request.body);
    const slug = slugify(input.name);
    const exists = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
    if (exists) return reply.code(409).send({ error: "CATEGORY_EXISTS", message: "Já existe uma categoria com este nome." });
    const [category] = await db.insert(categories).values({ ...input, slug }).returning();
    return reply.code(201).send({ data: category });
  });
  app.patch("/admin/categories/:id", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = z.object({ name: z.string().trim().min(2).max(80).optional(), description: z.string().trim().max(500).nullable().optional(), isActive: z.boolean().optional() }).parse(request.body);
    const [category] = await db.update(categories).set({ ...input, slug: input.name ? slugify(input.name) : undefined, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    if (!category) return reply.code(404).send({ error: "NOT_FOUND", message: "Categoria não encontrada." });
    return { data: category };
  });
  app.get("/admin/integrations", { preHandler: requireStaff }, async () => ({ data: (await db.select().from(integrations)).map(({ credentialsEncrypted: _secret, ...integration }) => integration) }));
  app.put("/admin/integrations/:provider", { preHandler: requireStaff }, async (request, reply) => {
    const { provider } = request.params as { provider: string };
    const body = z.object({ enabled: z.boolean(), settings: z.record(z.unknown()).default({}), credentials: z.record(z.string()).optional() }).parse(request.body);
    const existing = await db.query.integrations.findFirst({ where: eq(integrations.provider, provider) });
    const existingSettings = (existing?.settings && typeof existing.settings === "object" && !Array.isArray(existing.settings) ? existing.settings : {}) as Record<string, unknown>;
    const settings = { ...existingSettings, ...body.settings };
    const credentials = body.credentials ?? (existing?.credentialsEncrypted ? decryptSecret<Record<string, string>>(existing.credentialsEncrypted, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden") : {});
    if (provider === "whatsapp" && body.enabled) {
      const destinations = [...new Set((credentials.destinations ?? credentials.destination ?? "").split(",").map((value) => value.trim()).filter(Boolean))];
      const validated = Array.isArray(settings.validatedDestinations) ? settings.validatedDestinations.filter((value): value is string => typeof value === "string") : [];
      if (!destinations.length || !destinations.every((destination) => validated.includes(destination))) return reply.code(400).send({ error: "WHATSAPP_NOT_VALIDATED", message: "Salve os destinos, valide grupos/canais e só então ative o WhatsApp." });
    }
    const credentialsEncrypted = body.credentials ? encryptSecret(body.credentials, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden") : existing?.credentialsEncrypted ?? null;
    const [integration] = await db.insert(integrations).values({ provider, enabled: body.enabled, settings, credentialsEncrypted }).onConflictDoUpdate({ target: integrations.provider, set: { enabled: body.enabled, settings, credentialsEncrypted, updatedAt: new Date() } }).returning();
    const { credentialsEncrypted: _secret, ...safe } = integration;
    return { data: safe };
  });
  app.post("/admin/integrations/whatsapp/validate", { preHandler: requireStaff }, async (_request, reply) => {
    const integration = await db.query.integrations.findFirst({ where: eq(integrations.provider, "whatsapp") });
    if (!integration?.credentialsEncrypted) return reply.code(400).send({ error: "WHATSAPP_NOT_CONFIGURED", message: "Salve o bridge e os destinos do WhatsApp antes de validar." });
    const credentials = decryptSecret<Record<string, string>>(integration.credentialsEncrypted, process.env.INTEGRATION_ENCRYPTION_KEY ?? "development-integration-key-must-be-overridden");
    const destinations = [...new Set((credentials.destinations ?? credentials.destination ?? "").split(",").map((value) => value.trim()).filter(Boolean))];
    if (!credentials.bridgeUrl || !destinations.length) return reply.code(400).send({ error: "WHATSAPP_NOT_CONFIGURED", message: "Configure bridgeUrl e ao menos um grupo ou canal." });
    let result: { data?: Array<{ destination: string; ok: boolean; name?: string; isGroup?: boolean; message?: string }> };
    try {
      const response = await fetch(`${credentials.bridgeUrl.replace(/\/$/, "")}/validate-destinations`, { method: "POST", headers: { "content-type": "application/json", ...(credentials.bridgeToken ? { authorization: `Bearer ${credentials.bridgeToken}` } : {}) }, body: JSON.stringify({ destinations }), signal: AbortSignal.timeout(15_000) });
      result = await response.json().catch(() => ({}));
      if (!response.ok) return reply.code(400).send({ error: "WHATSAPP_VALIDATION_FAILED", message: "O bridge não conseguiu validar os destinos. Verifique QR, número e permissões." });
    } catch { return reply.code(400).send({ error: "WHATSAPP_VALIDATION_FAILED", message: "Não foi possível alcançar o bridge do WhatsApp." }); }
    const validatedDestinations = (result.data ?? []).filter((item) => item.ok).map((item) => item.destination);
    const settings = { ...((integration.settings && typeof integration.settings === "object" && !Array.isArray(integration.settings) ? integration.settings : {}) as Record<string, unknown>), validatedDestinations, validatedAt: new Date().toISOString() };
    await db.update(integrations).set({ settings, lastHealthAt: new Date(), updatedAt: new Date() }).where(eq(integrations.id, integration.id));
    return { data: result.data ?? [], allValid: destinations.every((destination) => validatedDestinations.includes(destination)) };
  });
  app.get("/admin/routines", { preHandler: requireStaff }, async () => ({ data: await db.query.routines.findMany({ with: { routineExecutions: { orderBy: [desc(routineExecutions.createdAt)], limit: 5 } }, orderBy: [desc(routines.updatedAt)] }) }));
  app.post("/admin/routines", { preHandler: requireStaff }, async (request, reply) => { const body = z.object({ name: z.string().min(3).max(120), enabled: z.boolean().default(false), scheduleCron: z.string().trim().regex(/^(\S+\s+){4}\S+$/, "Use cinco campos cron.").default("0 * * * *"), filters: z.record(z.unknown()).default({}), destinations: z.array(z.string()).default([]), dailyLimit: z.number().int().min(1).max(100).default(100) }).parse(request.body); const [routine] = await db.insert(routines).values(body).returning(); return reply.code(201).send({ data: routine }); });
  app.patch("/admin/routines/:id", { preHandler: requireStaff }, async (request) => { const { id } = request.params as { id: string }; const body = z.object({ name: z.string().min(3).max(120).optional(), enabled: z.boolean().optional(), scheduleCron: z.string().trim().regex(/^(\S+\s+){4}\S+$/, "Use cinco campos cron.").optional(), filters: z.record(z.unknown()).optional(), destinations: z.array(z.string()).optional(), dailyLimit: z.number().int().min(1).max(100).optional() }).parse(request.body); const [routine] = await db.update(routines).set({ ...body, updatedAt: new Date() }).where(eq(routines.id, id)).returning(); return { data: routine }; });
  app.post("/admin/routines/:id/run", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const routine = await db.query.routines.findFirst({ where: eq(routines.id, id) });
    if (!routine) return reply.code(404).send({ error: "NOT_FOUND", message: "Rotina não encontrada." });
    const [execution] = await db.insert(routineExecutions).values({ routineId: id, status: "QUEUED" }).returning();
    return reply.code(202).send({ data: execution, message: "Execução adicionada à fila do worker." });
  });
  app.get("/admin/automation", { preHandler: requireStaff }, async () => {
    const control = await db.query.integrations.findFirst({ where: eq(integrations.provider, "automation") });
    return { data: { paused: control ? !control.enabled : false } };
  });
  app.put("/admin/automation", { preHandler: requireStaff }, async (request) => {
    const { paused } = z.object({ paused: z.boolean() }).parse(request.body);
    await db.insert(integrations).values({ provider: "automation", enabled: !paused, settings: {} }).onConflictDoUpdate({ target: integrations.provider, set: { enabled: !paused, updatedAt: new Date() } });
    return { data: { paused } };
  });
  app.get("/admin/statistics", { preHandler: requireStaff }, async () => { const result = await db.execute<{ active: string; raw_clicks: string; filtered_clicks: string; comments: string }>(sql`select (select count(*) from offers where status = 'PUBLISHED') as active, (select count(*) from clicks where created_at > now() - interval '24 hours') as raw_clicks, (select count(*) from clicks where created_at > now() - interval '24 hours' and is_filtered = false) as filtered_clicks, (select count(*) from comments where is_hidden = false) as comments`); const row = result.rows[0]; const sources = await db.execute<{ source: string; clicks: string }>(sql`select source, count(*) as clicks from clicks where created_at > now() - interval '30 days' and is_filtered = false group by source order by clicks desc`); return { data: { activeOffers: Number(row?.active ?? 0), rawClicks24h: Number(row?.raw_clicks ?? 0), clicks24h: Number(row?.filtered_clicks ?? 0), visibleComments: Number(row?.comments ?? 0), clicksBySource: sources.rows.map((source) => ({ source: source.source, clicks: Number(source.clicks) })) } }; });
  app.get("/admin/publications", { preHandler: requireStaff }, async () => ({ data: await db.query.publications.findMany({ with: { offer: { with: { store: true } } }, orderBy: [desc(publications.createdAt)], limit: 100 }) }));
  app.patch("/admin/publications/:id", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = z.object({ status: z.enum(["PENDING", "PAUSED"]) }).parse(request.body);
    const [publication] = await db.update(publications).set({ status, error: status === "PENDING" ? null : undefined, updatedAt: new Date() }).where(eq(publications.id, id)).returning();
    if (!publication) return reply.code(404).send({ error: "NOT_FOUND", message: "Publicação não encontrada." });
    return { data: publication };
  });
}

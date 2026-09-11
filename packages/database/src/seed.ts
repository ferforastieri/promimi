import { db, categories, offers, stores } from "./index.js";
import { eq } from "drizzle-orm";

await db.insert(stores).values([{ name: "Amazon", slug: "amazon", domain: "amazon.com.br" }, { name: "Mercado Livre", slug: "mercado-livre", domain: "mercadolivre.com.br" }, { name: "Shopee", slug: "shopee", domain: "shopee.com.br" }]).onConflictDoNothing();
await db.insert(categories).values([{ name: "Tecnologia", slug: "tecnologia" }, { name: "Casa", slug: "casa" }, { name: "Esporte", slug: "esporte" }]).onConflictDoNothing();
const store = await db.query.stores.findFirst({ where: eq(stores.slug, "amazon") });
const category = await db.query.categories.findFirst({ where: eq(categories.slug, "tecnologia") });
if (store && category) await db.insert(offers).values({ slug: "fone-bluetooth-promimi", title: "Fone Bluetooth com cancelamento de ruído", storeId: store.id, categoryId: category.id, currentPrice: "189.90", originalPrice: "299.90", discountPercent: 36, affiliateUrl: "https://example.com", status: "PUBLISHED", publishedAt: new Date(), verifiedAt: new Date() }).onConflictDoNothing();
await db.$client.end();

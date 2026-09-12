import test from "node:test";
import assert from "node:assert/strict";
import {
  candidateDiscount,
  isEligible,
  normalizeCandidates,
  slugify,
  type CandidateOffer,
} from "./marketplaces.js";

const candidate: CandidateOffer = {
  provider: "amazon",
  title: "Teclado mecânico compacto",
  url: "https://example.test/keyboard",
  price: 150,
  originalPrice: 300,
  category: "Tecnologia",
};
test("filters invalid price, discount and keyword candidates", () => {
  assert.equal(
    isEligible(candidate, {
      maxPrice: 200,
      minDiscount: 40,
      keywords: ["teclado"],
    }),
    true,
  );
  assert.equal(isEligible(candidate, { minPrice: 151 }), false);
  assert.equal(isEligible(candidate, { keywords: ["monitor"] }), false);
  assert.equal(slugify("Câmera & Lente 4K"), "camera-lente-4k");
});
test("calculates only verifiable discounts for revalidated prices", () => {
  assert.equal(candidateDiscount({ price: 79.9, originalPrice: 100 }), 20);
  assert.equal(candidateDiscount({ price: 100, originalPrice: 100 }), null);
  assert.equal(
    candidateDiscount({ price: 100, originalPrice: undefined }),
    null,
  );
});
test("processes 100 simulated offers without admitting duplicates, invalid prices or expiry", () => {
  const now = new Date("2026-09-11T12:00:00Z");
  const batch: Array<{
    title: string;
    url: string;
    price: number;
    originalPrice: number;
    expiresAt?: string;
  }> = Array.from({ length: 100 }, (_, index) => ({
    title: `Oferta válida de tecnologia ${index}`,
    url: `https://example.test/${index}`,
    price: 100 + index,
    originalPrice: 200 + index,
  }));
  batch[10] = { ...batch[0] };
  batch[20] = { ...batch[20], price: -1 };
  batch[30] = { ...batch[30], expiresAt: "2020-01-01T00:00:00Z" };
  const result = normalizeCandidates("amazon", batch, new Set(), now);
  assert.equal(result.accepted.length, 97);
  assert.equal(result.duplicates, 1);
  assert.equal(result.rejected, 2);
});

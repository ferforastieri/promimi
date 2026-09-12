import test from "node:test";
import assert from "node:assert/strict";
import { publicationCard, publicationText } from "./templates.js";

const offer = {
  id: "1",
  slug: "fone",
  title: "Fone Bluetooth",
  currentPrice: "99.90",
  originalPrice: "199.90",
  discountPercent: 50,
  couponCode: "SOM10",
  affiliateUrl: "https://example.test/fone",
  store: { name: "Loja" },
};
test("publishing templates preserve disclosure and verified price", () => {
  assert.match(publicationText(offer, "telegram"), /R\$\s?99,90/);
  assert.match(
    publicationText(offer, "telegram"),
    /Alguns links podem render comissão/,
  );
  assert.equal(publicationCard(offer).coupon, "SOM10");
});

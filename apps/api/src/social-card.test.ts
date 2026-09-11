import assert from "node:assert/strict";
import test from "node:test";
import { socialCardSvg } from "./social-card.js";

test("renders a deterministic and escaped social card", () => {
  const svg = socialCardSvg({ title: "Fone <especial>", currentPrice: "99.90", originalPrice: "199.90", discountPercent: 50, couponCode: "SOM10", store: { name: "Loja & Cia" } });
  assert.match(svg, /width="1200" height="630"/);
  assert.match(svg, /Fone &lt;especial&gt;/);
  assert.match(svg, /R\$\s?99,90/);
  assert.match(svg, /CUPOM SOM10/);
});

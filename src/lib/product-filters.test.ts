import { describe, expect, test } from "vitest";
import { parseProductFilters, toFilterQuery } from "@/lib/product-filter-params";
import { EMPTY_FILTERS, filterAndSortCards, getCardPrice } from "@/lib/product-filters";
import type { ProductCardItem } from "@/types/catalogue";

function card(id: string, sortOrder: number, variants: ProductCardItem["variants"], specs = {}): ProductCardItem {
  return {
    id, slug: id, name: `Cot ${id}`, categorySlug: "cots", brandId: null, brandName: null, imageUrl: null,
    isFeatured: false, sortOrder, createdAt: "2026-11-01", specs, collectionIds: [], colours: [], variants,
  };
}

const classic = card("classic", 1, [
  { qualityId: "ideal", sizeLabel: "King", colourId: "teak", mrp: 26800, price: 18800 },
  { qualityId: "royal", sizeLabel: "King", colourId: "teak", mrp: 46800, price: 39800 },
]);
const platform = card("platform", 2, [{ qualityId: "royal", sizeLabel: "Queen", colourId: "walnut", mrp: null, price: 37800 }]);

describe("getCardPrice", () => {
  test("is the cheapest variant in the chosen quality", () => {
    expect(getCardPrice(classic, { ...EMPTY_FILTERS, qualityIds: ["royal"] })?.price).toBe(39800);
    expect(getCardPrice(classic, EMPTY_FILTERS)?.price).toBe(18800);
  });

  test("is null when no variant matches", () => {
    expect(getCardPrice(classic, { ...EMPTY_FILTERS, sizeLabels: ["Queen"] })).toBeNull();
  });
});

describe("filterAndSortCards", () => {
  test("drops cards with no matching variant", () => {
    const result = filterAndSortCards([classic, platform], { ...EMPTY_FILTERS, colourIds: ["walnut"] });
    expect(result.map((item) => item.card.id)).toEqual(["platform"]);
  });

  test("sorts by price, low to high", () => {
    const result = filterAndSortCards([platform, classic], { ...EMPTY_FILTERS, sort: "price_asc" });
    expect(result.map((item) => item.card.id)).toEqual(["classic", "platform"]);
  });

  test("filters by spec value", () => {
    const firm = card("firm", 3, classic.variants, { Comfort: "Firm" });
    const result = filterAndSortCards([classic, firm], { ...EMPTY_FILTERS, specs: { Comfort: ["Firm"] } });
    expect(result.map((item) => item.card.id)).toEqual(["firm"]);
  });
});

describe("filter URL params", () => {
  test("round-trips filters through the query string", () => {
    const filters = { ...EMPTY_FILTERS, qualityIds: ["a", "b"], specs: { Comfort: ["Firm"] }, priceMax: 30000, sort: "price_asc" as const };
    expect(parseProductFilters(new URLSearchParams(toFilterQuery(filters)))).toEqual(filters);
  });

  test("ignores invalid values", () => {
    const filters = parseProductFilters(new URLSearchParams("sort=cheapest&price_max=-5&discount=abc"));
    expect(filters).toEqual(EMPTY_FILTERS);
  });
});

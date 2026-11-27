import { describe, expect, test } from "vitest";
import { getAddonUnitPrice, getUnitTotal, listOfferedAddons } from "@/lib/pricing";

const king = { qualityId: "ideal", sizeLabel: "King", seats: null };
const sofa = { qualityId: "affordable", sizeLabel: "3+1+1 / 3+2", seats: 5 };

describe("getAddonUnitPrice", () => {
  test("returns the price for the variant's quality", () => {
    const storage = { priceUnit: "fixed" as const, sizeLabel: "King", prices: { ideal: 5800 } };
    expect(getAddonUnitPrice(storage, king)).toBe(5800);
  });

  test("is null when the add-on has no price for the quality", () => {
    const tableOnlyPremium = { priceUnit: "fixed" as const, sizeLabel: null, prices: { premium: 12000 } };
    expect(getAddonUnitPrice(tableOnlyPremium, sofa)).toBeNull();
  });

  test("is null for another size (King storage on a Queen)", () => {
    const storage = { priceUnit: "fixed" as const, sizeLabel: "King", prices: { ideal: 5800 } };
    expect(getAddonUnitPrice(storage, { ...king, sizeLabel: "Queen" })).toBeNull();
  });

  test("multiplies per-seat prices by the seat count", () => {
    const recliner = { priceUnit: "per_seat" as const, sizeLabel: null, prices: { affordable: 9000 } };
    expect(getAddonUnitPrice(recliner, sofa)).toBe(45000);
  });

  test("is null for a per-seat add-on when seats are unknown", () => {
    const recliner = { priceUnit: "per_seat" as const, sizeLabel: null, prices: { affordable: 9000 } };
    expect(getAddonUnitPrice(recliner, { ...sofa, seats: null })).toBeNull();
  });
});

describe("listOfferedAddons", () => {
  test("keeps only add-ons priced for the variant", () => {
    const addons = [
      { id: "a", priceUnit: "fixed" as const, sizeLabel: null, prices: { ideal: 3500 } },
      { id: "b", priceUnit: "fixed" as const, sizeLabel: "Queen", prices: { ideal: 4800 } },
    ];
    expect(listOfferedAddons(addons, king).map((addon) => addon.id)).toEqual(["a"]);
  });
});

describe("getUnitTotal", () => {
  test("adds add-on prices to the variant price", () => {
    expect(getUnitTotal(18800, [5800, 3500])).toBe(28100);
  });
});

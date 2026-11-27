import { describe, expect, test } from "vitest";
import { isChoiceAvailable, listAxisValues, pickVariant, toChoice } from "@/lib/variant-picker";
import type { VariantOption } from "@/types/catalogue";

function variant(id: string, qualityId: string, sizeLabel: string, lengthIn: number | null, colourId: string): VariantOption {
  return {
    id, sku: id, sizeLabel, lengthIn, widthIn: 72, thicknessIn: null, seats: null,
    qualityId, colourId, mrp: null, price: 100,
  };
}

// Royal has no Single; Ideal has King 75, King 78 and Single.
const variants = [
  variant("ideal-k75-teak", "ideal", "King", 75, "teak"),
  variant("ideal-k75-walnut", "ideal", "King", 75, "walnut"),
  variant("ideal-k78-teak", "ideal", "King", 78, "teak"),
  variant("ideal-single-teak", "ideal", "Single", null, "teak"),
  variant("royal-k75-walnut", "royal", "King", 75, "walnut"),
];

describe("pickVariant", () => {
  test("finds the exact match", () => {
    const choice = toChoice(variants[0]);
    expect(pickVariant(variants, { ...choice, colour: "walnut" }, "colour")?.id).toBe("ideal-k75-walnut");
  });

  test("keeps size and colour when the quality changes, if possible", () => {
    const choice = toChoice(variants[1]);
    expect(pickVariant(variants, { ...choice, quality: "royal" }, "quality")?.id).toBe("royal-k75-walnut");
  });

  test("falls back to the new quality's first variant when the size is missing", () => {
    const choice = toChoice(variants[3]);
    expect(pickVariant(variants, { ...choice, quality: "royal" }, "quality")?.id).toBe("royal-k75-walnut");
  });

  test("treats 75 in and 78 in as different sizes", () => {
    const choice = toChoice(variants[0]);
    expect(pickVariant(variants, { ...choice, size: "King|78" }, "size")?.id).toBe("ideal-k78-teak");
  });
});

describe("isChoiceAvailable", () => {
  test("a size missing in the chosen quality is unavailable", () => {
    const royal = toChoice(variants[4]);
    expect(isChoiceAvailable(variants, royal, "size", "Single|")).toBe(false);
    expect(isChoiceAvailable(variants, royal, "size", "King|75")).toBe(true);
  });
});

describe("listAxisValues", () => {
  test("lists each size once, in variant order", () => {
    expect(listAxisValues(variants, "size").map((item) => item.value)).toEqual(["King|75", "King|78", "Single|"]);
  });
});

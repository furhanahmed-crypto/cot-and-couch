import { describe, expect, test } from "vitest";
import { listCombos, toChoiceKey } from "@/services/products/bulk-variants";
import { buildSku } from "@/services/products/variant-lookups";

describe("listCombos", () => {
  test("makes every size x quality x colour", () => {
    const combos = listCombos({
      sizes: [{ sizeLabel: "King", lengthIn: 75, widthIn: 72 }, { sizeLabel: "King", lengthIn: 78, widthIn: 72 }],
      qualityIds: ["ideal", "royal"],
      colourIds: ["teak", "walnut", "honey"],
      thicknessIns: [],
    });
    expect(combos).toHaveLength(12);
    expect(combos[0]).toEqual({ sizeLabel: "King", lengthIn: 75, widthIn: 72, thicknessIn: null, qualityId: "ideal", colourId: "teak" });
  });

  test("an empty list means the field is not used", () => {
    const combos = listCombos({ sizes: [{ sizeLabel: "3-Seater", lengthIn: null, widthIn: null }], qualityIds: [], colourIds: [], thicknessIns: [] });
    expect(combos).toEqual([{ sizeLabel: "3-Seater", lengthIn: null, widthIn: null, thicknessIn: null, qualityId: null, colourId: null }]);
  });
});

test("choice keys tell 75 in and 78 in apart", () => {
  const base = { sizeLabel: "King", widthIn: 72, thicknessIn: null, qualityId: "q", colourId: null };
  expect(toChoiceKey({ ...base, lengthIn: 75 })).not.toBe(toChoiceKey({ ...base, lengthIn: 78 }));
});

describe("buildSku", () => {
  test("joins the parts in upper case", () => {
    const parts = { sizeLabel: "King", lengthIn: 78, thicknessIn: null, qualitySlug: "ideal-range", colourName: "Teak" };
    expect(buildSku("classic-cot", parts, [])).toBe("CLASSIC-COT-KING-78-IDEAL-RANGE-TEAK");
  });

  test("adds -2 when the SKU is taken", () => {
    const parts = { sizeLabel: "Queen", lengthIn: 78, thicknessIn: 6 };
    expect(buildSku("wake-fit-ortho", parts, ["WAKE-FIT-ORTHO-QUEEN-78-6IN"])).toBe("WAKE-FIT-ORTHO-QUEEN-78-6IN-2");
  });
});

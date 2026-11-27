import { describe, expect, test } from "vitest";
import { addonPriceGridSchema, colourFormSchema, qualityFormSchema } from "@/validation/catalogue";
import { bulkVariantsSchema, productSpecsSchema, variantFormSchema } from "@/validation/products";

const productId = "8f8a2a3c-6b7d-4e2f-9a1b-1c2d3e4f5a6b";

describe("variantFormSchema", () => {
  const base = { productId, sizeLabel: "King", price: "18800" };

  test("turns form strings into numbers and empty fields into null", () => {
    const parsed = variantFormSchema.parse({ ...base, mrp: "", lengthIn: "75", thicknessIn: "" });
    expect(parsed).toMatchObject({ price: 18800, mrp: null, lengthIn: 75, thicknessIn: null });
  });

  test("rejects a price of 0", () => {
    expect(variantFormSchema.safeParse({ ...base, price: "0" }).error?.issues[0].message).toBe("Price must be more than 0");
  });

  test("rejects an MRP below the price, on the MRP field", () => {
    const issue = variantFormSchema.safeParse({ ...base, mrp: "10000" }).error?.issues[0];
    expect(issue?.message).toBe("MRP cannot be lower than the price");
    expect(issue?.path).toEqual(["mrp"]);
  });
});

describe("bulkVariantsSchema", () => {
  test("caps the number of combinations", () => {
    const sizes = Array.from({ length: 30 }, (_, index) => ({ sizeLabel: `S${index}` }));
    const ids = Array.from({ length: 20 }, () => productId);
    expect(bulkVariantsSchema.safeParse({ productId, sizes, qualityIds: ids, price: "100" }).success).toBe(false);
  });
});

test("spec labels must be unique", () => {
  const specs = [{ label: "Comfort", value: "Firm" }, { label: "comfort", value: "Soft" }];
  expect(productSpecsSchema.safeParse({ productId, specs }).error?.issues[0].message).toBe("Each spec label can be used once");
});

test("colour hex must be #RRGGBB", () => {
  expect(colourFormSchema.safeParse({ name: "Teak", hex: "brown" }).success).toBe(false);
  expect(colourFormSchema.safeParse({ name: "Teak", hex: "#C19A6B" }).success).toBe(true);
});

test("warranty years: empty is allowed, 0 is not", () => {
  const base = { categoryId: productId, name: "Ideal Range" };
  expect(qualityFormSchema.parse({ ...base, warrantyYears: "" }).warrantyYears).toBeNull();
  expect(qualityFormSchema.safeParse({ ...base, warrantyYears: "0" }).success).toBe(false);
});

test("price grid cells need a price above 0", () => {
  const cell = { addonId: productId, qualityId: productId, price: "0" };
  expect(addonPriceGridSchema.safeParse({ addonIds: [productId], cells: [cell] }).success).toBe(false);
});

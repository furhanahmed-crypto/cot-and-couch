import { describe, expect, test } from "vitest";
import { isUniqueViolation } from "@/lib/db-errors";
import { makeUniqueSlug, toSlug } from "@/lib/slug";

describe("toSlug", () => {
  test("lowercases and joins words with dashes", () => {
    expect(toSlug("Luxury High Back")).toBe("luxury-high-back");
  });

  test("drops symbols and extra dashes", () => {
    expect(toSlug("  3-Step Extend Sofa! ")).toBe("3-step-extend-sofa");
    expect(toSlug("Teak Sofa — Detach")).toBe("teak-sofa-detach");
  });
});

describe("makeUniqueSlug", () => {
  test("keeps a free slug", () => {
    expect(makeUniqueSlug("classic-cot", ["storage-cot"])).toBe("classic-cot");
  });

  test("adds -2, -3… when taken", () => {
    expect(makeUniqueSlug("classic-cot", ["classic-cot"])).toBe("classic-cot-2");
    expect(makeUniqueSlug("classic-cot", ["classic-cot", "classic-cot-2"])).toBe("classic-cot-3");
  });
});

describe("isUniqueViolation", () => {
  test("finds the Postgres code under Drizzle's wrapper", () => {
    const wrapped = { message: "Failed query", cause: { code: "23505", constraint: "product_variants_choice_key" } };
    expect(isUniqueViolation(wrapped)).toBe(true);
    expect(isUniqueViolation(wrapped, "product_variants_choice_key")).toBe(true);
    expect(isUniqueViolation(wrapped, "products_slug_unique")).toBe(false);
  });

  test("is false for other errors", () => {
    expect(isUniqueViolation(new Error("network"))).toBe(false);
    expect(isUniqueViolation({ cause: { code: "23503" } })).toBe(false);
  });
});

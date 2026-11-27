import { describe, expect, test } from "vitest";
import { lineTotal, toRupees, toRupeesOrNull } from "@/lib/money";

describe("toRupees", () => {
  test("converts a DB numeric string to whole rupees", () => {
    expect(toRupees("18800.00")).toBe(18800);
  });

  test("rounds paise to the nearest rupee", () => {
    expect(toRupees("99.50")).toBe(100);
    expect(toRupees(99.49)).toBe(99);
  });

  test("throws for a value that is not a number", () => {
    expect(() => toRupees("abc")).toThrow("Not a valid amount");
  });
});

describe("toRupeesOrNull", () => {
  test("keeps a missing MRP as null", () => {
    expect(toRupeesOrNull(null)).toBeNull();
    expect(toRupeesOrNull(undefined)).toBeNull();
    expect(toRupeesOrNull("")).toBeNull();
  });

  test("converts a present value", () => {
    expect(toRupeesOrNull("26800.00")).toBe(26800);
  });
});

describe("lineTotal", () => {
  test("multiplies unit price by quantity", () => {
    expect(lineTotal(9000, 5)).toBe(45000);
  });

  test("returns 0 for quantity 0", () => {
    expect(lineTotal(18800, 0)).toBe(0);
  });
});

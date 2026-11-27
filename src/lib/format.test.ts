import { describe, expect, test } from "vitest";
import {
  discountPercent,
  formatDate,
  formatPhone,
  formatPrice,
} from "@/lib/format";

describe("formatPrice", () => {
  test("uses the rupee sign and Indian grouping", () => {
    expect(formatPrice(123456)).toBe("₹1,23,456");
  });

  test("shows no decimals", () => {
    expect(formatPrice(18800)).toBe("₹18,800");
  });
});

describe("formatDate", () => {
  test("formats in IST, not UTC", () => {
    // 20:00 UTC on 26 Nov is 01:30 on 27 Nov in India.
    expect(formatDate("2026-11-26T20:00:00Z")).toBe("27 Nov 2026");
  });
});

describe("formatPhone", () => {
  test("splits a 10-digit mobile into 5 + 5", () => {
    expect(formatPhone("9876543210")).toBe("98765 43210");
  });

  test("ignores spaces and dashes in the input", () => {
    expect(formatPhone("98765-432 10")).toBe("98765 43210");
  });

  test("returns anything else unchanged", () => {
    expect(formatPhone("12345")).toBe("12345");
  });
});

describe("discountPercent", () => {
  test("rounds the saving to a whole percent", () => {
    expect(discountPercent(26800, 18800)).toBe(30);
  });

  test("returns 0 when MRP is 0", () => {
    expect(discountPercent(0, 100)).toBe(0);
  });
});

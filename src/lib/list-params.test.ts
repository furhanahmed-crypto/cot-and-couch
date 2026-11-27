import { describe, expect, test } from "vitest";
import { clampPage, formatPageRange, getPageOffset, parsePage, readChoice } from "@/lib/list-params";
import { getAdminNav, isNavItemActive } from "@/constants/admin-nav";

describe("parsePage", () => {
  test("reads a positive whole number", () => {
    expect(parsePage("3")).toBe(3);
  });

  test("falls back to 1 for anything else", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage(["2", "3"])).toBe(1);
  });
});

describe("clampPage", () => {
  test("a page past the end becomes the last page", () => {
    expect(clampPage(9, 45, 20)).toBe(3);
  });

  test("an empty list stays on page 1", () => {
    expect(clampPage(4, 0, 20)).toBe(1);
  });
});

describe("formatPageRange", () => {
  test("shows the rows on this page", () => {
    expect(formatPageRange(2, 132, 20)).toBe("21–40 of 132");
    expect(formatPageRange(7, 132, 20)).toBe("121–132 of 132");
  });

  test("shows 0 of 0 when empty", () => {
    expect(formatPageRange(1, 0, 20)).toBe("0 of 0");
  });
});

test("getPageOffset skips earlier pages", () => {
  expect(getPageOffset(3, 20)).toBe(40);
});

test("readChoice ignores unknown values", () => {
  expect(readChoice("30d", ["7d", "30d"] as const, "7d")).toBe("30d");
  expect(readChoice("90d", ["7d", "30d"] as const, "7d")).toBe("7d");
});

describe("admin nav", () => {
  test("team users do not see admin-only screens", () => {
    const labels = getAdminNav(false).flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toEqual(["Dashboard", "Products", "Orders", "Leads", "Media"]);
  });

  test("admins see every screen", () => {
    expect(getAdminNav(true).flatMap((section) => section.items)).toHaveLength(10);
  });

  test("dashboard is active only on /admin; other items also on sub-pages", () => {
    expect(isNavItemActive("/admin", "/admin/products")).toBe(false);
    expect(isNavItemActive("/admin/products", "/admin/products/123")).toBe(true);
  });
});

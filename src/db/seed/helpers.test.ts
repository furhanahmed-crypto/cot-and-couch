import { describe, expect, it } from "vitest";
import { lowestPriceOf, rankByLowestPrice } from "./helpers";

describe("rankByLowestPrice", () => {
  it("gives 1 to the cheapest product", () => {
    expect(rankByLowestPrice([33800, 11800, 17800])).toEqual([3, 1, 2]);
  });

  it("keeps the price-list order for equal prices", () => {
    expect(rankByLowestPrice([12800, 11800, 12800])).toEqual([2, 1, 3]);
  });
});

describe("lowestPriceOf", () => {
  it("returns each product's cheapest variant", () => {
    const variants = [
      { productId: "a", price: 29800 },
      { productId: "a", price: 18800 },
      { productId: "b", price: 49800 },
    ];
    expect(lowestPriceOf(["b", "a"], variants)).toEqual([49800, 18800]);
  });
});

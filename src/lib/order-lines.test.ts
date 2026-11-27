import { describe, expect, it } from "vitest";
import { buildOrderLines, type OrderLineAddon, type OrderLineVariant } from "./order-lines";

const sofa: OrderLineVariant = {
  id: "v-sofa", productId: "p-sofa", categoryId: "c-sofa", productName: "Sofa", sku: "SOFA-3-1-1",
  sizeLabel: "3+1+1", qualityId: "q-gold", qualityName: "Gold", colourName: null, seats: 5, mrp: null, price: 50000,
};
const cot: OrderLineVariant = {
  id: "v-cot", productId: "p-cot", categoryId: "c-cot", productName: "Cot", sku: "COT-KING",
  sizeLabel: "King", qualityId: "q-teak", qualityName: "Teak", colourName: "Walnut", seats: null, mrp: 30000, price: 25000,
};
const recliner: OrderLineAddon = {
  id: "a-recliner", name: "Recliner", kind: "recliner", priceUnit: "per_seat", sizeLabel: null,
  prices: { "q-gold": 3000 }, categoryId: "c-sofa", productId: "p-sofa", isActive: true,
};
const storage: OrderLineAddon = {
  id: "a-storage", name: "Storage", kind: "addon", priceUnit: "fixed", sizeLabel: "King",
  prices: { "q-teak": 4000 }, categoryId: "c-cot", productId: null, isActive: true,
};

function request(variantId: string, addonIds: string[] = [], quantity = 1) {
  return { variantId, quantity, addonIds, customLengthIn: null, customWidthIn: null };
}

describe("buildOrderLines", () => {
  it("adds add-on prices per unit and multiplies by quantity", () => {
    const { lines, subtotal } = buildOrderLines([request("v-cot", ["a-storage"], 2)], [cot], [storage]);
    expect(lines[0]?.unitPrice).toBe(29000);
    expect(lines[0]?.lineTotal).toBe(58000);
    expect(subtotal).toBe(58000);
  });

  it("multiplies per-seat add-ons by the variant's seats", () => {
    const { lines } = buildOrderLines([request("v-sofa", ["a-recliner"])], [sofa], [recliner]);
    expect(lines[0]?.addons[0]?.price).toBe(15000);
    expect(lines[0]?.unitPrice).toBe(65000);
  });

  it("adds up the subtotal over all lines", () => {
    const { subtotal } = buildOrderLines([request("v-cot"), request("v-sofa", [], 2)], [cot, sofa], []);
    expect(subtotal).toBe(125000);
  });

  it("keeps the custom size on the line without changing the price", () => {
    const { lines } = buildOrderLines([{ ...request("v-cot"), customLengthIn: 80, customWidthIn: 70 }], [cot], []);
    expect(lines[0]).toMatchObject({ customLengthIn: 80, customWidthIn: 70, unitPrice: 25000 });
  });

  it("rejects a missing variant", () => {
    expect(() => buildOrderLines([request("v-gone")], [cot], [])).toThrow("no longer available");
  });

  it("rejects an add-on from another category", () => {
    expect(() => buildOrderLines([request("v-cot", ["a-recliner"])], [cot], [recliner])).toThrow("not available");
  });

  it("rejects an inactive add-on", () => {
    expect(() => buildOrderLines([request("v-cot", ["a-storage"])], [cot], [{ ...storage, isActive: false }])).toThrow("not available");
  });

  it("rejects a size-limited add-on on another size", () => {
    expect(() => buildOrderLines([request("v-cot", ["a-storage"])], [{ ...cot, sizeLabel: "Queen" }], [storage])).toThrow("not available");
  });
});

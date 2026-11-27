import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { OrderStatus } from "@/constants/orders";
import { db } from "./db";
import { newId, toMoney, toMoneyOrNull } from "./helpers";
import type { SeededAddon, SeededVariant } from "./types";

type DemoOrderInput = {
  profileId: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  status: OrderStatus;
  /** Share of the subtotal paid up front, 0 to 1. */
  advanceShare: number;
  staffId: string | null;
  lines: { variant: SeededVariant; quantity: number; addons: SeededAddon[] }[];
};

/** Add-on price for one unit of this variant (per-seat prices times the seat count). */
function addonUnitPrice(addon: SeededAddon, variant: SeededVariant): number {
  const price = addon.prices[variant.qualityId ?? ""] ?? 0;
  if (addon.priceUnit === "per_seat") return price * (variant.seats ?? 1);
  return price;
}

function buildOrderRows(input: DemoOrderInput) {
  const orderId = newId();
  const items = input.lines.map((line, index) => {
    const addonTotal = line.addons.reduce((sum, addon) => sum + addonUnitPrice(addon, line.variant), 0);
    const { variant } = line;
    return {
      row: {
        id: newId(), orderId, variantId: variant.id, productName: variant.productName, sku: variant.sku,
        sizeLabel: variant.sizeLabel, qualityName: variant.qualityName, colourName: variant.colourName,
        quantity: line.quantity, unitMrp: toMoneyOrNull(variant.mrp), unitPrice: toMoney(variant.price),
        lineTotal: toMoney((variant.price + addonTotal) * line.quantity), sortOrder: index + 1,
      },
      addons: line.addons.map((addon) => ({ addon, price: addonUnitPrice(addon, variant) })),
      total: (variant.price + addonTotal) * line.quantity,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const order = {
    id: orderId, profileId: input.profileId, customerName: input.customerName,
    customerPhone: input.customerPhone, address: input.address, subtotal: toMoney(subtotal),
    advancePaid: toMoney(Math.round(subtotal * input.advanceShare)),
    salespersonId: input.staffId, updatedById: input.staffId,
  };
  const itemAddons = items.flatMap((item) =>
    item.addons.map(({ addon, price }) => ({
      orderItemId: item.row.id, addonId: addon.id, name: addon.name, priceUnit: addon.priceUnit, price: toMoney(price),
    })),
  );
  return { order, items: items.map((item) => item.row), itemAddons };
}

/**
 * Orders are inserted as "confirmed", then moved to their status, so the
 * log_order_status() trigger writes a realistic history.
 */
export async function seedDemoOrders(inputs: DemoOrderInput[]) {
  const built = inputs.map(buildOrderRows);
  await db.batch([
    db.insert(schema.orders).values(built.map((rows) => rows.order)),
    db.insert(schema.orderItems).values(built.flatMap((rows) => rows.items)),
    db.insert(schema.orderItemAddons).values(built.flatMap((rows) => rows.itemAddons)),
  ]);

  const moved = inputs
    .map((input, index) => ({ id: built[index].order.id, status: input.status }))
    .filter((order) => order.status !== "confirmed");
  if (!moved.length) return;
  const [first, ...rest] = moved.map((order) =>
    db.update(schema.orders).set({ status: order.status }).where(eq(schema.orders.id, order.id)),
  );
  await db.batch([first, ...rest]);
}

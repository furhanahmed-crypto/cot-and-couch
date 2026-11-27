import { and, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { colours, orderItemAddons, orderItems, orders, productVariants, products, qualities } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { toMoney, toMoneyOrNull, toRupees, toRupeesOrNull } from "@/lib/money";
import { buildOrderLines, type OrderLine, type OrderLineVariant } from "@/lib/order-lines";
import { listAddonOptionsByIds } from "@/services/cart/addon-options";
import type { newOrderSchema } from "@/validation/orders";

type NewOrderData = z.output<typeof newOrderSchema>;

/** Active variants of published products, with the names the snapshot needs. */
async function listSellableVariants(ids: string[]): Promise<OrderLineVariant[]> {
  const rows = await db
    .select({
      id: productVariants.id, productId: products.id, categoryId: products.categoryId, productName: products.name,
      sku: productVariants.sku, sizeLabel: productVariants.sizeLabel, qualityId: productVariants.qualityId,
      qualityName: qualities.name, colourName: colours.name, seats: productVariants.seats,
      mrp: productVariants.mrp, price: productVariants.price,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(qualities, eq(qualities.id, productVariants.qualityId))
    .leftJoin(colours, eq(colours.id, productVariants.colourId))
    .where(and(inArray(productVariants.id, ids), eq(productVariants.isActive, true), eq(products.status, "published")));
  return rows.map((row) => ({ ...row, mrp: toRupeesOrNull(row.mrp), price: toRupees(row.price) }));
}

function toItemRows(orderId: string, lines: OrderLine[]) {
  return lines.map((line, index) => ({
    id: crypto.randomUUID(),
    orderId,
    variantId: line.variant.id,
    productName: line.variant.productName,
    sku: line.variant.sku,
    sizeLabel: line.variant.sizeLabel,
    qualityName: line.variant.qualityName,
    colourName: line.variant.colourName,
    customLengthIn: line.customLengthIn,
    customWidthIn: line.customWidthIn,
    quantity: line.quantity,
    unitMrp: toMoneyOrNull(line.variant.mrp),
    unitPrice: toMoney(line.unitPrice),
    lineTotal: toMoney(line.lineTotal),
    sortOrder: index,
  }));
}

/**
 * Creates the order with snapshots of every item, in one transaction.
 * Prices come from the database, never from the form.
 */
export async function createOrder(data: NewOrderData, staffId: string): Promise<{ id: string }> {
  const variantIds = [...new Set(data.items.map((item) => item.variantId))];
  const addonIds = [...new Set(data.items.flatMap((item) => item.addonIds))];
  const [variants, addons] = await Promise.all([listSellableVariants(variantIds), listAddonOptionsByIds(addonIds)]);
  const { lines, subtotal } = buildOrderLines(data.items, variants, addons);
  if (data.advancePaid > subtotal) throw new AppError("Advance paid cannot be more than the order total");

  const orderId = crypto.randomUUID();
  const itemRows = toItemRows(orderId, lines);
  const addonRows = lines.flatMap((line, index) =>
    line.addons.map((addon) => ({
      orderItemId: itemRows[index]!.id, addonId: addon.id, name: addon.name, priceUnit: addon.priceUnit, price: toMoney(addon.price),
    })),
  );
  const insertOrder = db.insert(orders).values({
    id: orderId, profileId: data.profileId, customerName: data.customerName, customerPhone: data.customerPhone,
    address: data.address, subtotal: toMoney(subtotal), advancePaid: toMoney(data.advancePaid),
    expectedDelivery: data.expectedDelivery, notes: data.notes, salespersonId: staffId, updatedById: staffId,
  });
  const insertItems = db.insert(orderItems).values(itemRows);
  if (addonRows.length) await db.batch([insertOrder, insertItems, db.insert(orderItemAddons).values(addonRows)]);
  else await db.batch([insertOrder, insertItems]);
  return { id: orderId };
}

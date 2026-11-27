import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItemAddons, orderItems, orders } from "@/db/schema";
import { toRupees } from "@/lib/money";
import type { OrderSummary } from "@/types/shop";

/** A customer's own orders, newest first, from the order snapshots. */
export async function listOrdersForProfile(profileId: string): Promise<OrderSummary[]> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.profileId, profileId))
    .orderBy(desc(orders.createdAt));
  if (!orderRows.length) return [];

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderRows.map((order) => order.id)))
    .orderBy(asc(orderItems.sortOrder));
  const addonRows = itemRows.length
    ? await db.select().from(orderItemAddons).where(inArray(orderItemAddons.orderItemId, itemRows.map((item) => item.id)))
    : [];

  return orderRows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    expectedDelivery: order.expectedDelivery,
    subtotal: toRupees(order.subtotal),
    advancePaid: toRupees(order.advancePaid),
    items: itemRows
      .filter((item) => item.orderId === order.id)
      .map((item) => ({
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        qualityName: item.qualityName,
        colourName: item.colourName,
        quantity: item.quantity,
        lineTotal: toRupees(item.lineTotal),
        addonNames: addonRows.filter((addon) => addon.orderItemId === item.id).map((addon) => addon.name),
      })),
  }));
}

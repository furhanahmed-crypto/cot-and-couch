import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { orderStatusHistory, orders } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { toMoney, toRupees } from "@/lib/money";
import type { orderDetailsSchema, orderStatusChangeSchema } from "@/validation/orders";

type StatusChange = z.output<typeof orderStatusChangeSchema>;
type OrderDetailsData = z.output<typeof orderDetailsSchema>;

async function getOrderState(orderId: string) {
  const [order] = await db.select({ status: orders.status, subtotal: orders.subtotal }).from(orders).where(eq(orders.id, orderId));
  if (!order) throw new AppError("This order no longer exists");
  return order;
}

/**
 * The trigger writes the history row (with who changed it) when the status
 * changes; the note is then added to that newest row in the same transaction.
 * Choosing the current status again does nothing.
 */
export async function changeOrderStatus(change: StatusChange, staffId: string): Promise<{ changed: boolean }> {
  const order = await getOrderState(change.orderId);
  if (order.status === change.status) return { changed: false };

  const updateOrder = db.update(orders).set({ status: change.status, updatedById: staffId }).where(eq(orders.id, change.orderId));
  if (!change.note) {
    await updateOrder;
    return { changed: true };
  }
  const newestEntry = db
    .select({ id: orderStatusHistory.id })
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, change.orderId))
    .orderBy(desc(orderStatusHistory.changedAt))
    .limit(1);
  await db.batch([updateOrder, db.update(orderStatusHistory).set({ note: change.note }).where(eq(orderStatusHistory.id, newestEntry))]);
  return { changed: true };
}

export async function updateOrderDetails(orderId: string, data: OrderDetailsData, staffId: string): Promise<void> {
  const order = await getOrderState(orderId);
  if (data.advancePaid > toRupees(order.subtotal)) throw new AppError("Advance paid cannot be more than the order total");
  await db
    .update(orders)
    .set({
      advancePaid: toMoney(data.advancePaid),
      expectedDelivery: data.expectedDelivery,
      deliveryPhotoUrl: data.deliveryPhotoUrl,
      notes: data.notes,
      updatedById: staffId,
    })
    .where(eq(orders.id, orderId));
}

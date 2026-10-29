"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  orderLines,
  orderStatusHistory,
  orders,
  optionGroups,
  productOptionValues,
  products,
} from "@/db";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "closed",
  "issue",
];

function revalidateOrders() {
  revalidatePath(ROUTES.admin.orders);
  revalidatePath(ROUTES.admin.dashboard);
}

function parseMoney(value: string) {
  const n = Number(String(value).replace(/[, ]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}

export async function createOrderAction(input: {
  customerName: string;
  customerMobile: string;
  address: string;
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  agreedPrice: string;
  advancePaid: string;
  expectedDelivery: string;
  salespersonName: string;
  status: OrderStatus;
}) {
  await requireStaffProfile();
  const customerName = input.customerName.trim();
  const customerMobile = input.customerMobile.trim();
  const address = input.address.trim();
  if (!customerName || !customerMobile || !address) {
    return { ok: false as const, error: "Customer name, mobile, and address required" };
  }
  if (!STATUSES.includes(input.status)) {
    return { ok: false as const, error: "Invalid status" };
  }
  const agreed = parseMoney(input.agreedPrice);
  const advance = parseMoney(input.advancePaid || "0");
  if (agreed == null || advance == null) {
    return { ok: false as const, error: "Enter valid prices" };
  }
  const qty = Math.max(1, Math.floor(input.quantity || 1));
  const staffName = input.salespersonName.trim() || "Admin";

  const [order] = await db
    .insert(orders)
    .values({
      customerName,
      customerMobile,
      address,
      subtotal: agreed,
      advancePaid: advance,
      expectedDelivery: input.expectedDelivery.trim() || null,
      status: input.status,
    })
    .returning({ id: orders.id });

  await db.insert(orderLines).values({
    orderId: order.id,
    productId: input.productId || null,
    variantId: input.variantId || null,
    quantity: qty,
    unitPrice: agreed,
    lineTotal: agreed,
    sortOrder: 0,
  });

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    status: input.status,
    byName: staffName,
    note: "Order recorded",
  });

  revalidateOrders();
  return { ok: true as const, id: order.id };
}

export async function updateOrderAction(input: {
  id: string;
  customerName: string;
  customerMobile: string;
  address: string;
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  agreedPrice: string;
  advancePaid: string;
  expectedDelivery: string;
  salespersonName: string;
  status: OrderStatus;
}) {
  await requireStaffProfile();
  const customerName = input.customerName.trim();
  const customerMobile = input.customerMobile.trim();
  const address = input.address.trim();
  if (!customerName || !customerMobile || !address) {
    return { ok: false as const, error: "Customer name, mobile, and address required" };
  }
  if (!STATUSES.includes(input.status)) {
    return { ok: false as const, error: "Invalid status" };
  }
  const agreed = parseMoney(input.agreedPrice);
  const advance = parseMoney(input.advancePaid || "0");
  if (agreed == null || advance == null) {
    return { ok: false as const, error: "Enter valid prices" };
  }

  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, input.id))
    .limit(1);
  if (!existing) return { ok: false as const, error: "Order not found" };

  const qty = Math.max(1, Math.floor(input.quantity || 1));
  const staffName = input.salespersonName.trim() || "Admin";

  await db
    .update(orders)
    .set({
      customerName,
      customerMobile,
      address,
      subtotal: agreed,
      advancePaid: advance,
      expectedDelivery: input.expectedDelivery.trim() || null,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, input.id));

  const [line] = await db
    .select({ id: orderLines.id })
    .from(orderLines)
    .where(eq(orderLines.orderId, input.id))
    .limit(1);

  if (line) {
    await db
      .update(orderLines)
      .set({
        productId: input.productId || null,
        variantId: input.variantId || null,
        quantity: qty,
        unitPrice: agreed,
        lineTotal: agreed,
      })
      .where(eq(orderLines.id, line.id));
  } else {
    await db.insert(orderLines).values({
      orderId: input.id,
      productId: input.productId || null,
      variantId: input.variantId || null,
      quantity: qty,
      unitPrice: agreed,
      lineTotal: agreed,
      sortOrder: 0,
    });
  }

  if (existing.status !== input.status) {
    await db.insert(orderStatusHistory).values({
      orderId: input.id,
      status: input.status,
      byName: staffName,
      note: `Status → ${input.status}`,
    });
  }

  revalidateOrders();
  return { ok: true as const };
}

export async function deleteOrderAction(id: string) {
  await requireStaffProfile();
  await db.delete(orders).where(eq(orders.id, id));
  revalidateOrders();
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderStatusHistory, orders } from "@/db/schema";
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

function revalidateSales() {
  revalidatePath(ROUTES.admin.sales);
  revalidatePath(ROUTES.admin.dashboard);
}

function parseMoney(value: string) {
  const n = Number(String(value).replace(/[, ]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}

export async function createSaleAction(input: {
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

  const [row] = await db
    .insert(orders)
    .values({
      customerName,
      customerMobile,
      address,
      productId: input.productId || null,
      variantId: input.variantId || null,
      quantity: qty,
      agreedPrice: agreed,
      advancePaid: advance,
      expectedDelivery: input.expectedDelivery.trim() || null,
      salespersonName: input.salespersonName.trim() || null,
      status: input.status,
    })
    .returning({ id: orders.id });

  await db.insert(orderStatusHistory).values({
    orderId: row.id,
    status: input.status,
    byName: input.salespersonName.trim() || "Admin",
    note: "Sale recorded",
  });

  revalidateSales();
  return { ok: true as const, id: row.id };
}

export async function updateSaleAction(input: {
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
  if (!existing) return { ok: false as const, error: "Sale not found" };

  await db
    .update(orders)
    .set({
      customerName,
      customerMobile,
      address,
      productId: input.productId || null,
      variantId: input.variantId || null,
      quantity: Math.max(1, Math.floor(input.quantity || 1)),
      agreedPrice: agreed,
      advancePaid: advance,
      expectedDelivery: input.expectedDelivery.trim() || null,
      salespersonName: input.salespersonName.trim() || null,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, input.id));

  if (existing.status !== input.status) {
    await db.insert(orderStatusHistory).values({
      orderId: input.id,
      status: input.status,
      byName: input.salespersonName.trim() || "Admin",
      note: `Status → ${input.status}`,
    });
  }

  revalidateSales();
  return { ok: true as const };
}

export async function deleteSaleAction(id: string) {
  await requireStaffProfile();
  await db.delete(orders).where(eq(orders.id, id));
  revalidateSales();
  return { ok: true as const };
}

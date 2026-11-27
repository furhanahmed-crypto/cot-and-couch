import { connection } from "next/server";
import { and, asc, count, desc, eq, gte, ilike, inArray, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { orderItemAddons, orderItems, orderStatusHistory, orders, profiles } from "@/db/schema";
import { clampPage, getPageOffset, PAGE_SIZE } from "@/lib/list-params";
import { toRupees, toRupeesOrNull } from "@/lib/money";
import { escapeLikePattern } from "@/services/catalogue/product-card-queries";
import { getRangeStart } from "@/services/dashboard/queries";
import type { OrderAdminFilters, OrderAdminRow, OrderDetail, OrderDetailItem } from "@/types/admin-orders";
import type { Page } from "@/types/pagination";

/** Search matches the order number, the customer's name or phone (digits only). */
function buildWhere(filters: OrderAdminFilters): SQL | undefined {
  const pattern = `%${escapeLikePattern(filters.q)}%`;
  const digits = filters.q.replace(/\D/g, "");
  return and(
    filters.q
      ? or(
          ilike(orders.orderNumber, pattern),
          ilike(orders.customerName, pattern),
          digits ? ilike(orders.customerPhone, `%${digits}%`) : undefined,
        )
      : undefined,
    filters.status ? eq(orders.status, filters.status) : undefined,
    filters.range === "all" ? undefined : gte(orders.createdAt, getRangeStart(filters.range)),
  );
}

export async function listOrdersForAdmin(filters: OrderAdminFilters): Promise<Page<OrderAdminRow>> {
  await connection(); // the date filter counts back from now: read the clock per request
  const where = buildWhere(filters);
  const [totalRow] = await db.select({ total: count() }).from(orders).where(where);
  const total = totalRow?.total ?? 0;
  const page = clampPage(filters.page, total);

  const rows = await db
    .select({
      id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, customerPhone: orders.customerPhone,
      subtotal: orders.subtotal, advancePaid: orders.advancePaid, status: orders.status,
      expectedDelivery: orders.expectedDelivery, createdAt: orders.createdAt, itemCount: count(orderItems.id),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(where)
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset(getPageOffset(page));

  const items = rows.map((row) => ({
    ...row,
    subtotal: toRupees(row.subtotal),
    advancePaid: toRupees(row.advancePaid),
    createdAt: row.createdAt.toISOString(),
  }));
  return { items, total, page, pageSize: PAGE_SIZE };
}

async function listOrderItems(orderId: string): Promise<OrderDetailItem[]> {
  const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.sortOrder));
  const addonRows = itemRows.length
    ? await db.select().from(orderItemAddons).where(inArray(orderItemAddons.orderItemId, itemRows.map((item) => item.id)))
    : [];
  return itemRows.map((item) => ({
    id: item.id, productName: item.productName, sku: item.sku, sizeLabel: item.sizeLabel,
    qualityName: item.qualityName, colourName: item.colourName,
    customLengthIn: item.customLengthIn, customWidthIn: item.customWidthIn, quantity: item.quantity,
    unitMrp: toRupeesOrNull(item.unitMrp), unitPrice: toRupees(item.unitPrice), lineTotal: toRupees(item.lineTotal),
    addons: addonRows
      .filter((addon) => addon.orderItemId === item.id)
      .map((addon) => ({ id: addon.id, name: addon.name, priceUnit: addon.priceUnit, price: toRupees(addon.price) })),
  }));
}

async function listOrderHistory(orderId: string) {
  const rows = await db
    .select({
      id: orderStatusHistory.id, status: orderStatusHistory.status, note: orderStatusHistory.note,
      changedAt: orderStatusHistory.changedAt, changedByName: profiles.name, changedByEmail: profiles.email,
    })
    .from(orderStatusHistory)
    .leftJoin(profiles, eq(profiles.id, orderStatusHistory.changedById))
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(desc(orderStatusHistory.changedAt));
  return rows.map(({ changedByEmail, ...row }) => ({
    ...row,
    changedByName: row.changedByName ?? changedByEmail,
    changedAt: row.changedAt.toISOString(),
  }));
}

const salesperson = alias(profiles, "salesperson");

export async function getOrderForAdmin(orderId: string): Promise<OrderDetail | null> {
  const [row] = await db
    .select({ order: orders, salespersonName: salesperson.name, salespersonEmail: salesperson.email })
    .from(orders)
    .leftJoin(salesperson, eq(salesperson.id, orders.salespersonId))
    .where(eq(orders.id, orderId));
  if (!row) return null;
  const [items, history] = await Promise.all([listOrderItems(orderId), listOrderHistory(orderId)]);
  const { order } = row;
  return {
    id: order.id, orderNumber: order.orderNumber, status: order.status,
    customerName: order.customerName, customerPhone: order.customerPhone, address: order.address,
    hasAccount: order.profileId !== null,
    salespersonName: row.salespersonName ?? row.salespersonEmail,
    subtotal: toRupees(order.subtotal), advancePaid: toRupees(order.advancePaid),
    expectedDelivery: order.expectedDelivery, deliveryPhotoUrl: order.deliveryPhotoUrl, notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items, history,
  };
}

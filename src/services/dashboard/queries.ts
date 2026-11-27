import { connection } from "next/server";
import { and, count, desc, eq, gte, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { leads, orders, products } from "@/db/schema";
import { OPEN_ORDER_STATUSES } from "@/constants/orders";
import { toRupees } from "@/lib/money";
import type { DashboardRange, DashboardStats, HotLead, RecentOrder } from "@/types/dashboard";

const PANEL_ROWS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<DashboardRange, number> = { "7d": 7, "30d": 30 };

/** Start of the range, counted back from now. */
export function getRangeStart(range: DashboardRange, now: Date = new Date()): Date {
  return new Date(now.getTime() - RANGE_DAYS[range] * DAY_MS);
}

async function countRows(table: typeof orders | typeof leads | typeof products, where: SQL | undefined): Promise<number> {
  const [row] = await db.select({ total: count() }).from(table).where(where);
  return row?.total ?? 0;
}

/** The four numbers on the dashboard. All are real counts. */
export async function getDashboardStats(range: DashboardRange): Promise<DashboardStats> {
  await connection(); // the range counts back from now: read the clock per request, never at build time
  const since = getRangeStart(range);
  const [openOrders, ordersInRange, newLeadsInRange, publishedProducts] = await Promise.all([
    countRows(orders, inArray(orders.status, OPEN_ORDER_STATUSES)),
    countRows(orders, gte(orders.createdAt, since)),
    countRows(leads, gte(leads.createdAt, since)),
    countRows(products, eq(products.status, "published")),
  ]);
  return { openOrders, ordersInRange, newLeadsInRange, publishedProducts };
}

export async function listRecentOrders(): Promise<RecentOrder[]> {
  const rows = await db
    .select({
      id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName,
      subtotal: orders.subtotal, status: orders.status, createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(PANEL_ROWS);
  return rows.map((row) => ({ ...row, subtotal: toRupees(row.subtotal), createdAt: row.createdAt.toISOString() }));
}

/** Hot leads still waiting for a follow-up, most recently active first. */
export async function listHotLeads(): Promise<HotLead[]> {
  const rows = await db
    .select({ id: leads.id, name: leads.name, phone: leads.phone, area: leads.area, lastSeenAt: leads.lastSeenAt })
    .from(leads)
    .where(and(eq(leads.intent, "hot"), eq(leads.followUpDone, false)))
    .orderBy(desc(leads.lastSeenAt))
    .limit(PANEL_ROWS);
  return rows.map((row) => ({ ...row, lastSeenAt: row.lastSeenAt.toISOString() }));
}

import { cache } from "react";
import { and, count, eq, gte, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "@/db";
import {
  galleryItems,
  leadEvents,
  leads,
  orderLines,
  orders,
  products,
} from "@/db";
import type {
  AttentionItem,
  CategoryInterest,
  DashboardKpi,
  DeliveryRow,
  TopProductRow,
} from "@/components/admin/dashboard/dashboard-types";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types";

export type AdminDashboardRange = 7 | 30;

type Period = { start: Date; end: Date; prevStart: Date; prevEnd: Date };

function buildPeriod(days: AdminDashboardRange): Period {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const prevEnd = start;
  const prevStart = new Date(prevEnd.getTime() - days * 86_400_000);
  return { start, end, prevStart, prevEnd };
}

function trendLabel(current: number, previous: number) {
  if (previous === 0 && current === 0) return { text: "Same as prior period", tone: "muted" as const };
  if (previous === 0) return { text: `+${current} vs prior period`, tone: "up" as const };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: "Same as prior period", tone: "muted" as const };
  if (pct > 0) return { text: `+${pct}% vs prior period`, tone: "up" as const };
  return { text: `${pct}% vs prior period`, tone: "warn" as const };
}

function sumSubtotals(rows: { subtotal: string | null }[]) {
  return rows.reduce((n, r) => n + Number(r.subtotal ?? 0), 0);
}

async function countLeadsBetween(from: Date, to: Date) {
  const [row] = await db
    .select({ n: count() })
    .from(leads)
    .where(and(gte(leads.firstSeenAt, from), lt(leads.firstSeenAt, to)));
  return Number(row?.n ?? 0);
}

async function countEventsBetween(
  from: Date,
  to: Date,
  eventType: "view" | "shortlist" | "cta",
) {
  const [row] = await db
    .select({ n: count() })
    .from(leadEvents)
    .where(
      and(
        eq(leadEvents.eventType, eventType),
        gte(leadEvents.occurredAt, from),
        lt(leadEvents.occurredAt, to),
      ),
    );
  return Number(row?.n ?? 0);
}

async function ordersCreatedBetween(from: Date, to: Date) {
  return db
    .select({ subtotal: orders.subtotal })
    .from(orders)
    .where(and(gte(orders.createdAt, from), lt(orders.createdAt, to)));
}

export const getAdminDashboardData = cache(
  async (input: {
    rangeDays: AdminDashboardRange;
    products: Product[];
    categories: { id: string; name: string }[];
  }) => {
    const period = buildPeriod(input.rangeDays);
    const catById = new Map(input.categories.map((c) => [c.id, c.name]));
    const productById = new Map(input.products.map((p) => [p.id, p]));

    const [
      newLeadsNow,
      newLeadsPrev,
      viewsNow,
      viewsPrev,
      ordersNowRows,
      ordersPrevRows,
      openOrdersRows,
      pendingGallery,
      hotOpen,
      draftOrThin,
      lowStockVariants,
      eventRows,
    ] = await Promise.all([
      countLeadsBetween(period.start, period.end),
      countLeadsBetween(period.prevStart, period.prevEnd),
      countEventsBetween(period.start, period.end, "view"),
      countEventsBetween(period.prevStart, period.prevEnd, "view"),
      ordersCreatedBetween(period.start, period.end),
      ordersCreatedBetween(period.prevStart, period.prevEnd),
      db
        .select({
          id: orders.id,
          customerName: orders.customerName,
          expectedDelivery: orders.expectedDelivery,
          status: orders.status,
        })
        .from(orders)
        .where(notInArray(orders.status, ["delivered", "closed"])),
      db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.approved, false)),
      db
        .select({ id: leads.id })
        .from(leads)
        .where(and(eq(leads.intent, "hot"), eq(leads.followUpDone, false))),
      Promise.resolve(
        input.products.filter((p) => p.status === "draft" || !p.description?.trim()),
      ),
      Promise.resolve(
        input.products.reduce(
          (n, p) =>
            n + p.variants.filter((v) => v.stockQty > 0 && v.stockQty <= 2).length,
          0,
        ),
      ),
      db
        .select({
          productId: leadEvents.productId,
          eventType: leadEvents.eventType,
          payload: leadEvents.payload,
        })
        .from(leadEvents)
        .where(
          and(
            gte(leadEvents.occurredAt, period.start),
            lt(leadEvents.occurredAt, period.end),
          ),
        ),
    ]);

    const revenueNow = sumSubtotals(ordersNowRows);
    const revenuePrev = sumSubtotals(ordersPrevRows);
    const leadTrend = trendLabel(newLeadsNow, newLeadsPrev);
    const viewTrend = trendLabel(viewsNow, viewsPrev);
    const revenueTrend = trendLabel(revenueNow, revenuePrev);

    const openOrders = openOrdersRows.length;
    const dueToday = openOrdersRows.filter((o) => {
      if (!o.expectedDelivery) return false;
      return o.expectedDelivery.slice(0, 10) === new Date().toISOString().slice(0, 10);
    }).length;

    const weekEnd = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    const todayIso = new Date().toISOString().slice(0, 10);

    const orderIds = openOrdersRows.map((o) => o.id);
    const lines =
      orderIds.length === 0
        ? []
        : await db
            .select({
              orderId: orderLines.orderId,
              productId: orderLines.productId,
            })
            .from(orderLines)
            .where(inArray(orderLines.orderId, orderIds));

    const lineByOrder = new Map<string, string | null>();
    for (const line of lines) {
      if (!lineByOrder.has(line.orderId)) lineByOrder.set(line.orderId, line.productId);
    }

    const deliveries: DeliveryRow[] = openOrdersRows
      .filter((o) => {
        const d = o.expectedDelivery?.slice(0, 10);
        if (!d) return false;
        return d >= todayIso && d <= weekEnd;
      })
      .slice(0, 6)
      .map((o) => {
        const pid = lineByOrder.get(o.id);
        return {
          id: o.id,
          customer: o.customerName,
          product: pid ? (productById.get(pid)?.name ?? "Product") : "—",
          when: o.expectedDelivery ?? "",
          status: o.status,
        };
      });

    const viewCounts = new Map<string, number>();
    const shortlistCounts = new Map<string, number>();
    const enquiryCounts = new Map<string, number>();
    let visit = 0;
    let call = 0;
    let whatsapp = 0;

    for (const ev of eventRows) {
      if (ev.eventType === "view" && ev.productId) {
        viewCounts.set(ev.productId, (viewCounts.get(ev.productId) ?? 0) + 1);
      }
      if (ev.eventType === "shortlist" && ev.productId) {
        shortlistCounts.set(ev.productId, (shortlistCounts.get(ev.productId) ?? 0) + 1);
      }
      if (ev.eventType === "cta") {
        const type = (ev.payload?.type ?? "cta").toLowerCase();
        if (type.includes("visit") || type.includes("store")) visit += 1;
        else if (type.includes("call")) call += 1;
        else if (type.includes("whatsapp") || type.includes("wa")) whatsapp += 1;
        if (ev.productId) {
          enquiryCounts.set(
            ev.productId,
            (enquiryCounts.get(ev.productId) ?? 0) + 1,
          );
        }
      }
    }

    const topProducts: TopProductRow[] = [];
    for (const [id, views] of viewCounts.entries()) {
      const p = productById.get(id);
      if (!p) continue;
      const shortlists = shortlistCounts.get(id) ?? 0;
      const enquiries = enquiryCounts.get(id) ?? 0;
      const low = p.variants.some((v) => v.stockQty > 0 && v.stockQty <= 2);
      let signal = "Steady";
      let signalTone: TopProductRow["signalTone"] = "steady";
      if (low) {
        signal = "Low stock";
        signalTone = "danger";
      } else if (enquiries > 0) {
        signal = "CTA activity";
        signalTone = "ok";
      } else if (views > 0 && shortlists === 0) {
        signal = "Views only";
        signalTone = "warn";
      }
      topProducts.push({
        id,
        name: p.name,
        category: catById.get(p.categoryId) ?? "Catalogue",
        image: p.variants.find((v) => v.images[0])?.images[0],
        views,
        shortlists,
        enquiries,
        signal,
        signalTone,
      });
    }
    topProducts.sort((a, b) => b.views - a.views);
    topProducts.splice(6);

    const interestMap = new Map<string, number>();
    for (const [productId, c] of viewCounts) {
      const p = productById.get(productId);
      if (!p) continue;
      const name = catById.get(p.categoryId) ?? "Other";
      interestMap.set(name, (interestMap.get(name) ?? 0) + c);
    }
    const interestTotal = [...interestMap.values()].reduce((a, b) => a + b, 0) || 1;
    const interest: CategoryInterest[] = [...interestMap.entries()]
      .map(([name, c]) => ({
        name,
        count: c,
        pct: Math.round((c / interestTotal) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const attention: AttentionItem[] = [];
    if (draftOrThin.length > 0) {
      attention.push({
        text: `${draftOrThin.length} product${draftOrThin.length === 1 ? "" : "s"} need specs or publish`,
        href: ROUTES.admin.products,
        action: "Products",
      });
    }
    if (lowStockVariants > 0) {
      attention.push({
        text: `${lowStockVariants} variant${lowStockVariants === 1 ? "" : "s"} low on stock`,
        href: ROUTES.admin.products,
        action: "Stock",
      });
    }
    if (pendingGallery.length > 0) {
      attention.push({
        text: `${pendingGallery.length} gallery photo${pendingGallery.length === 1 ? "" : "s"} awaiting approval`,
        href: ROUTES.admin.gallery,
        action: "Review",
      });
    }
    if (hotOpen.length > 0) {
      attention.push({
        text: `${hotOpen.length} hot lead${hotOpen.length === 1 ? "" : "s"} need follow-up`,
        href: ROUTES.admin.leads,
        action: "Leads",
      });
    }

    const kpis: DashboardKpi[] = [
      {
        label: "New leads",
        value: String(newLeadsNow),
        trend: leadTrend.text,
        trendTone: leadTrend.tone,
        hint: `Last ${input.rangeDays} days · ${hotOpen.length} hot open`,
      },
      {
        label: "Catalogue views",
        value: viewsNow.toLocaleString("en-IN"),
        trend: viewTrend.text,
        trendTone: viewTrend.tone,
        hint: "From lead event stream",
      },
      {
        label: "Orders booked",
        value: formatInrCompact(revenueNow),
        trend: revenueTrend.text,
        trendTone: revenueTrend.tone,
        hint: `${ordersNowRows.length} order${ordersNowRows.length === 1 ? "" : "s"} in period`,
      },
      {
        label: "Open deliveries",
        value: String(openOrders),
        trend: dueToday > 0 ? `${dueToday} due today` : undefined,
        trendTone: dueToday > 0 ? "warn" : undefined,
        hint: dueToday > 0 ? "Dispatch today" : "None due today",
      },
    ];

    return {
      kpis,
      attention,
      topProducts,
      deliveries,
      interest,
      ctaSplit: { visit, call, whatsapp },
    };
  },
);

function formatInrCompact(amount: number) {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

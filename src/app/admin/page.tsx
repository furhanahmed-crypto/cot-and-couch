import { Suspense } from "react";
import {
  AdminDashboard,
  type AttentionItem,
  type CategoryInterest,
  type DeliveryRow,
  type TopProductRow,
} from "@/components/admin/admin-dashboard";
import { getAllProducts, getCategories } from "@/services/catalogue";
import { getGallery, getLeads, getOrders } from "@/services/ops";
import { getStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

export const instant = false;

function daysAgo(isoDate: string, days: number) {
  const t = new Date(isoDate).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= days * 86_400_000;
}

async function DashboardContent() {
  const [products, categories, leads, orders, gallery, staff] =
    await Promise.all([
      getAllProducts(),
      getCategories({ includeHidden: true }),
      getLeads(),
      getOrders(),
      getGallery(),
      getStaffProfile(),
    ]);

  const catById = new Map(categories.map((c) => [c.id, c]));
  const productById = new Map(products.map((p) => [p.id, p]));

  const newLeads = leads.filter((l) => daysAgo(l.firstSeen, 7)).length || leads.length;
  const viewCounts = new Map<string, number>();
  const shortlistCounts = new Map<string, number>();
  const enquiryCounts = new Map<string, number>();
  let visit = 0;
  let call = 0;
  let whatsapp = 0;

  for (const lead of leads) {
    for (const id of lead.viewedProductIds) {
      viewCounts.set(id, (viewCounts.get(id) ?? 0) + 1);
    }
    for (const id of lead.shortlistedIds) {
      shortlistCounts.set(id, (shortlistCounts.get(id) ?? 0) + 1);
    }
    for (const tap of lead.ctaTaps) {
      const type = tap.type.toLowerCase();
      if (type.includes("visit") || type.includes("store")) visit += 1;
      else if (type.includes("call")) call += 1;
      else if (type.includes("whatsapp") || type.includes("wa")) whatsapp += 1;
      if (tap.productId) {
        enquiryCounts.set(
          tap.productId,
          (enquiryCounts.get(tap.productId) ?? 0) + 1,
        );
      }
    }
  }

  const catalogueViews =
    [...viewCounts.values()].reduce((a, b) => a + b, 0) ||
    products.reduce((n, p) => n + Math.max(p.popularity, 0), 0);

  const openOrders = orders.filter(
    (o) => !["delivered", "closed"].includes(o.status),
  );
  const dueToday = openOrders.filter((o) => {
    if (!o.expectedDelivery) return false;
    return o.expectedDelivery.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }).length;

  const lowStock = products.reduce(
    (n, p) => n + p.variants.filter((v) => v.stockQty > 0 && v.stockQty <= 2).length,
    0,
  );
  const draftOrThin = products.filter(
    (p) => p.status === "draft" || !p.description?.trim(),
  ).length;
  const pendingPhotos = gallery.filter((g) => !g.approved).length;
  const hotStale = leads.filter(
    (l) => l.intent === "hot" && !l.followUpDone,
  ).length;

  const attention: AttentionItem[] = [];
  if (draftOrThin > 0) {
    attention.push({
      text: `${draftOrThin} product${draftOrThin === 1 ? " is" : "s are"} missing required specs or still draft`,
      href: ROUTES.admin.products,
      action: "Fix specs",
    });
  }
  if (lowStock > 0) {
    attention.push({
      text: `${lowStock} variant${lowStock === 1 ? " is" : "s are"} low on stock`,
      href: ROUTES.admin.stock,
      action: "Open stock",
    });
  }
  if (pendingPhotos > 0) {
    attention.push({
      text: `${pendingPhotos} delivery photo${pendingPhotos === 1 ? "" : "s"} awaiting approval`,
      href: ROUTES.admin.gallery,
      action: "Review",
    });
  }
  if (hotStale > 0) {
    attention.push({
      text: `${hotStale} hot lead${hotStale === 1 ? "" : "s"} not contacted`,
      href: ROUTES.admin.leads,
      action: "View leads",
    });
  }

  const scored = products
    .map((p) => {
      const views = viewCounts.get(p.id) ?? Math.max(0, Math.round(p.popularity / 10));
      const shortlists = shortlistCounts.get(p.id) ?? 0;
      const enquiries = enquiryCounts.get(p.id) ?? 0;
      const low = p.variants.some((v) => v.stockQty > 0 && v.stockQty <= 2);
      let signal = "Steady";
      let signalTone: TopProductRow["signalTone"] = "steady";
      if (low) {
        signal = "Low stock";
        signalTone = "danger";
      } else if (enquiries > 0 && views > 0) {
        signal = "Converting";
        signalTone = "ok";
      } else if (views > 0 && shortlists === 0 && enquiries === 0) {
        signal = "Viewed, rarely added";
        signalTone = "warn";
      }
      return {
        id: p.id,
        name: p.name,
        category: catById.get(p.categoryId)?.name ?? "Catalogue",
        image: p.variants.find((v) => v.images[0])?.images[0],
        views,
        shortlists,
        enquiries,
        signal,
        signalTone,
        rank: views * 2 + shortlists * 3 + enquiries * 5 + p.popularity / 100,
      };
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 6)
    .map(({ rank: _r, ...row }) => row);

  const deliveries: DeliveryRow[] = openOrders.slice(0, 6).map((o) => ({
    id: o.id,
    customer: o.customerName,
    product: productById.get(o.productId)?.name ?? "Product",
    when: o.expectedDelivery,
    status: o.status,
  }));

  const interestMap = new Map<string, number>();
  for (const [productId, count] of viewCounts) {
    const p = productById.get(productId);
    if (!p) continue;
    const name = catById.get(p.categoryId)?.name ?? "Other";
    interestMap.set(name, (interestMap.get(name) ?? 0) + count);
  }
  if (interestMap.size === 0) {
    for (const p of products.filter((x) => x.status === "published")) {
      const name = catById.get(p.categoryId)?.name ?? "Other";
      interestMap.set(name, (interestMap.get(name) ?? 0) + 1);
    }
  }
  const interestTotal = [...interestMap.values()].reduce((a, b) => a + b, 0) || 1;
  const interest: CategoryInterest[] = [...interestMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / interestTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const first = (staff?.name ?? "there").split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AdminDashboard
      greeting={`${hello}, ${first}`}
      subtitle={`${todayLabel} · ${openOrders.length} deliveries open, ${hotStale} hot leads waiting`}
      kpis={[
        {
          label: "New leads",
          value: String(newLeads),
          trend: `${leads.filter((l) => l.intent === "hot").length} hot intent`,
          trendTone: "up",
          hint: `${leads.filter((l) => !l.followUpDone).length} open follow-ups`,
        },
        {
          label: "Catalogue views",
          value: catalogueViews.toLocaleString("en-IN"),
          hint: `${leads.length} unique visitors (from leads)`,
        },
        {
          label: "Store / Call / WhatsApp",
          value: String(visit + call + whatsapp),
          hint: `${visit} store · ${call} call · ${whatsapp} WhatsApp`,
        },
        {
          label: "Open deliveries",
          value: String(openOrders.length),
          trend: dueToday > 0 ? `${dueToday} due today` : undefined,
          trendTone: dueToday > 0 ? "warn" : undefined,
          hint: dueToday > 0 ? "Needs dispatch today" : "None due today",
        },
      ]}
      attention={attention}
      topProducts={scored}
      deliveries={deliveries}
      interest={interest}
      ctaSplit={{ visit, call, whatsapp }}
    />
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

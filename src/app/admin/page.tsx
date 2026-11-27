import Link from "next/link";
import { Boxes, Plus, ReceiptText, UserRound, Clock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { HotLeadsPanel } from "@/components/admin/dashboard/hot-leads-panel";
import { RangeSwitch } from "@/components/admin/dashboard/range-switch";
import { RecentOrdersPanel } from "@/components/admin/dashboard/recent-orders-panel";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { readChoice } from "@/lib/list-params";
import { cn } from "@/lib/utils";
import { getDashboardStats, listHotLeads, listRecentOrders } from "@/services/dashboard/queries";
import { DASHBOARD_RANGES } from "@/types/dashboard";

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const range = readChoice((await searchParams).range, DASHBOARD_RANGES, "7d");
  const rangeText = range === "7d" ? "last 7 days" : "last 30 days";
  const [stats, recentOrders, hotLeads] = await Promise.all([
    getDashboardStats(range),
    listRecentOrders(),
    listHotLeads(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="What needs attention in the showroom."
        action={
          <>
            <Link href={ROUTES.admin.newProduct} className={cn(buttonVariants({ variant: "outline" }))}>
              <Plus className="size-4" /> Add product
            </Link>
            <Link href={ROUTES.admin.newOrder} className={cn(buttonVariants())}>
              <Plus className="size-4" /> New order
            </Link>
          </>
        }
      />
      <RangeSwitch current={range} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open orders" value={stats.openOrders} hint="Not delivered or closed yet" icon={Clock} href={ROUTES.admin.orders} />
        <StatCard label="Orders" value={stats.ordersInRange} hint={`Created in the ${rangeText}`} icon={ReceiptText} href={ROUTES.admin.orders} />
        <StatCard label="New leads" value={stats.newLeadsInRange} hint={`First seen in the ${rangeText}`} icon={UserRound} href={ROUTES.admin.leads} />
        <StatCard label="Published products" value={stats.publishedProducts} hint="Visible in the shop now" icon={Boxes} href={ROUTES.admin.products} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersPanel orders={recentOrders} />
        <HotLeadsPanel leads={hotLeads} />
      </div>
    </div>
  );
}

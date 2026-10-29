import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllProducts, getCategories } from "@/services/catalogue";
import {
  getAdminDashboardData,
  type AdminDashboardRange,
} from "@/services/admin-dashboard";
import { getStaffProfile } from "@/services/profile";

export const instant = false;

type PageProps = { searchParams: Promise<{ range?: string }> };

function parseRange(raw: string | undefined): AdminDashboardRange {
  return raw === "30" ? 30 : 7;
}

async function DashboardContent({ rangeDays }: { rangeDays: AdminDashboardRange }) {
  const [products, categories, staff] = await Promise.all([
    getAllProducts(),
    getCategories({ includeHidden: true }),
    getStaffProfile(),
  ]);

  const data = await getAdminDashboardData({
    rangeDays,
    products,
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
  });

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
      subtitle={`${todayLabel} · metrics for the last ${rangeDays} days`}
      rangeDays={rangeDays}
      {...data}
    />
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const rangeDays = parseRange((await searchParams).range);

  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      }
    >
      <DashboardContent rangeDays={rangeDays} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { Eye, MousePointerClick, Package, Truck, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts } from "@/services/catalogue";
import { getLeads, getOrders } from "@/services/ops";

export const instant = false;

async function DashboardContent() {
  const [products, leads, sales] = await Promise.all([
    getAllProducts(),
    getLeads(),
    getOrders(),
  ]);

  const metrics = [
    {
      label: "Published products",
      value: String(products.filter((p) => p.status === "published").length),
      hint: "From Neon catalogue",
      icon: Package,
    },
    {
      label: "Open leads",
      value: String(leads.filter((l) => !l.followUpDone).length),
      hint: `${leads.filter((l) => l.intent === "hot").length} hot intent`,
      icon: MousePointerClick,
    },
    {
      label: "Top product",
      value:
        products.sort((a, b) => b.popularity - a.popularity)[0]?.name ?? "—",
      hint: "By sort / popularity",
      icon: Eye,
    },
    {
      label: "CTA taps",
      value: String(leads.reduce((n, l) => n + l.ctaTaps.length, 0)),
      hint: "Visit store / WhatsApp / call",
      icon: MousePointerClick,
    },
    {
      label: "Open deliveries",
      value: String(
        sales.filter((s) => !["delivered", "closed"].includes(s.status)).length,
      ),
      hint: "Not yet delivered or closed",
      icon: Truck,
    },
    {
      label: "Staff",
      value: "Neon profiles",
      icon: UserCheck,
      hint: "Admin / team roles",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {m.label}
            </CardTitle>
            <m.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl leading-tight">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live metrics from Neon catalogue + ops tables."
      />
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading metrics…</p>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}

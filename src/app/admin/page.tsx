"use client";

import { Eye, MousePointerClick, Package, Truck, UserCheck } from "lucide-react";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leads, products, sales } from "@/data/mock";

const METRICS = [
  {
    label: "Staff logins (mock)",
    value: "2 today",
    hint: "Admin + team sessions in prototype",
    icon: UserCheck,
  },
  {
    label: "Open leads",
    value: String(leads.filter((l) => !l.followUpDone).length),
    hint: `${leads.filter((l) => l.intent === "hot").length} hot intent`,
    icon: MousePointerClick,
  },
  {
    label: "Top viewed (mock)",
    value: products.sort((a, b) => b.popularity - a.popularity)[0]?.name ?? "—",
    hint: "By popularity score in seed data",
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
    label: "Low stock SKUs",
    value: String(
      products.flatMap((p) => p.variants).filter((v) => v.stockStatus === "low_stock").length,
    ),
    hint: "Variants flagged low in mock catalogue",
    icon: Package,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Snapshot from mock seed data — refreshes on reload."
      />
      <MockBanner compact />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <Card key={m.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="size-4 text-brass" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl text-ink">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

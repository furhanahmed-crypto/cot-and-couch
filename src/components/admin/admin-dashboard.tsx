import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Phone,
  Store,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminDashboardProps } from "@/components/admin/dashboard/dashboard-types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type {
  AdminDashboardProps,
  AttentionItem,
  CategoryInterest,
  DashboardKpi,
  DeliveryRow,
  TopProductRow,
} from "@/components/admin/dashboard/dashboard-types";

const signalClass: Record<
  AdminDashboardProps["topProducts"][0]["signalTone"],
  string
> = {
  ok: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  steady: "bg-muted text-muted-foreground",
  warn: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  danger: "bg-destructive/15 text-destructive",
};

export function AdminDashboard({
  greeting,
  subtitle,
  rangeDays,
  kpis,
  attention,
  topProducts,
  deliveries,
  interest,
  ctaSplit,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-xl tracking-tight text-ink sm:text-2xl md:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <RangeLink days={7} active={rangeDays === 7} />
            <RangeLink days={30} active={rangeDays === 30} />
          </div>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            nativeButton={false}
            render={<Link href={ROUTES.admin.orders} />}
          >
            + Record order
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl leading-tight">{k.value}</p>
              {k.trend ? (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    k.trendTone === "up" && "text-emerald-700 dark:text-emerald-400",
                    k.trendTone === "warn" && "text-destructive",
                    (!k.trendTone || k.trendTone === "muted") &&
                      "text-muted-foreground",
                  )}
                >
                  {k.trend}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-muted-foreground">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          <AttentionCard attention={attention} />
          <TopProductsCard rangeDays={rangeDays} topProducts={topProducts} />
        </div>
        <div className="space-y-4">
          <DeliveriesCard deliveries={deliveries} />
          <InterestCard interest={interest} rangeDays={rangeDays} />
          <CtaMixCard ctaSplit={ctaSplit} />
        </div>
      </div>
    </div>
  );
}

function RangeLink({ days, active }: { days: 7 | 30; active: boolean }) {
  return (
    <Link
      href={`${ROUTES.admin.dashboard}?range=${days}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <CalendarDays className="size-3.5" />
      {days}d
    </Link>
  );
}

function AttentionCard({
  attention,
}: {
  attention: AdminDashboardProps["attention"];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing urgent right now.</p>
        ) : (
          attention.map((item) => (
            <div
              key={item.text}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2.5"
            >
              <p className="min-w-0 flex-1 text-sm">{item.text}</p>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href={item.href} />}
              >
                {item.action}
                <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TopProductsCard({
  rangeDays,
  topProducts,
}: {
  rangeDays: number;
  topProducts: AdminDashboardProps["topProducts"];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-heading text-base sm:text-lg">
          Top viewed products — last {rangeDays} days
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="self-start text-muted-foreground sm:self-auto"
          nativeButton={false}
          render={<Link href={ROUTES.admin.leads} />}
        >
          All leads
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead className="w-16 text-right">Views</TableHead>
              <TableHead className="w-20 text-right">Shortlists</TableHead>
              <TableHead className="w-20 text-right">CTAs</TableHead>
              <TableHead className="min-w-[100px]">Signal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    href={ROUTES.admin.productEdit(p.id)}
                    className="flex items-center gap-2.5"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium hover:underline">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.category}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.views}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.shortlists}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.enquiries}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("font-normal", signalClass[p.signalTone])}
                  >
                    {p.signal}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {topProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No product views in this period — browsing shows up in lead events.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DeliveriesCard({
  deliveries,
}: {
  deliveries: AdminDashboardProps["deliveries"];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Deliveries this week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deliveries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open orders scheduled this week.
          </p>
        ) : (
          deliveries.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-border/70 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.product}</p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {d.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Expected {d.when || "—"}
              </p>
            </div>
          ))
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href={ROUTES.admin.orders} />}
        >
          Open orders
        </Button>
      </CardContent>
    </Card>
  );
}

function InterestCard({
  interest,
  rangeDays,
}: {
  interest: AdminDashboardProps["interest"];
  rangeDays: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">
          Views by category ({rangeDays}d)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {interest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No views in this period.</p>
        ) : (
          interest.map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(c.pct, 4)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CtaMixCard({
  ctaSplit,
}: {
  ctaSplit: AdminDashboardProps["ctaSplit"];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Store CTAs</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <Store className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-heading text-xl">{ctaSplit.visit}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Visit
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <Phone className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-heading text-xl">{ctaSplit.call}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Call
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <MessageCircle className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-1 font-heading text-xl">{ctaSplit.whatsapp}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            WhatsApp
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

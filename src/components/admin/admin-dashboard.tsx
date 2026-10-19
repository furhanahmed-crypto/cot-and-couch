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
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type DashboardKpi = {
  label: string;
  value: string;
  hint: string;
  /** Optional third line (e.g. trend) */
  trend?: string;
  trendTone?: "up" | "warn" | "muted";
};

export type AttentionItem = {
  text: string;
  href: string;
  action: string;
};

export type TopProductRow = {
  id: string;
  name: string;
  category: string;
  image?: string;
  views: number;
  shortlists: number;
  enquiries: number;
  signal: string;
  signalTone: "ok" | "steady" | "warn" | "danger";
};

export type DeliveryRow = {
  id: string;
  customer: string;
  product: string;
  when: string;
  status: string;
};

export type CategoryInterest = {
  name: string;
  count: number;
  pct: number;
};

export type AdminDashboardProps = {
  greeting: string;
  subtitle: string;
  kpis: DashboardKpi[];
  attention: AttentionItem[];
  topProducts: TopProductRow[];
  deliveries: DeliveryRow[];
  interest: CategoryInterest[];
  ctaSplit: { visit: number; call: number; whatsapp: number };
};

const signalClass: Record<TopProductRow["signalTone"], string> = {
  ok: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  steady: "bg-muted text-muted-foreground",
  warn: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  danger: "bg-destructive/15 text-destructive",
};

export function AdminDashboard({
  greeting,
  subtitle,
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
          <h1 className="font-heading text-2xl tracking-tight text-ink md:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled>
            <CalendarDays className="size-3.5" />
            Last 7 days
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.admin.sales} />}
          >
            + Record sale
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">Needs attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attention.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing urgent right now.
                </p>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="font-heading text-lg">
                Top viewed products — last 7 days
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                nativeButton={false}
                render={<Link href={ROUTES.admin.leads} />}
              >
                Behaviour report
              </Button>
            </CardHeader>
            <CardContent className="-mx-2 overflow-x-auto px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Shortlists</TableHead>
                    <TableHead>Enquiries</TableHead>
                    <TableHead>Signal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-[240px]">
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
                      <TableCell>{p.views}</TableCell>
                      <TableCell>{p.shortlists}</TableCell>
                      <TableCell>{p.enquiries}</TableCell>
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
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No browse signals yet — leads drive this table.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">
                Deliveries this week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open deliveries scheduled.
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
                        <p className="truncate text-xs text-muted-foreground">
                          {d.product}
                        </p>
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
                render={<Link href={ROUTES.admin.sales} />}
              >
                Open sales & delivery
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">
                Interest by category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interest.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category interest yet.</p>
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">CTA mix</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 px-2 py-3">
                <Store className="mx-auto size-4 text-muted-foreground" />
                <p className="mt-1 font-heading text-xl">{ctaSplit.visit}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Store
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
        </div>
      </div>
    </div>
  );
}

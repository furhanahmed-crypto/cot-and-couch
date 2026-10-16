"use client";

import { useState } from "react";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sales as seedSales } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import { formatINR } from "@/lib/format";
import type { OrderStatus, SaleOrder } from "@/types";

const FLOW: OrderStatus[] = [
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "closed",
];

function nextStatus(current: OrderStatus): OrderStatus | null {
  if (current === "issue") return null;
  const i = FLOW.indexOf(current);
  if (i < 0 || i >= FLOW.length - 1) return null;
  return FLOW[i + 1];
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SaleOrder[]>(() => [...seedSales]);

  function advance(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = nextStatus(o.status);
        if (!next) return o;
        return {
          ...o,
          status: next,
          history: [
            ...o.history,
            { status: next, at: new Date().toISOString(), by: "Console (mock)" },
          ],
        };
      }),
    );
    mockToast("Order status advanced in memory");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales orders"
        description="Advance status along the mock pipeline only — no notifications sent."
      />
      <MockBanner compact />
      <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Rules (prototype): confirmed → in production → out for delivery → delivered → closed. Issue
        status is manual-only in a real build.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Agreed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Advance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const next = nextStatus(o.status);
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>
                    <div>{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.expectedDelivery}</div>
                  </TableCell>
                  <TableCell>{formatINR(o.agreedPrice)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" disabled={!next} onClick={() => advance(o.id)}>
                      {next ? `→ ${next.replace(/_/g, " ")}` : "Done"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

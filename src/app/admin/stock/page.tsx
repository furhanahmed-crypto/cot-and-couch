"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
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
import { products as seedProducts } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import type { StockStatus } from "@/types";

type StockRow = {
  productName: string;
  sku: string;
  variantId: string;
  stockQty: number;
  stockStatus: StockStatus;
};

function deriveStatus(qty: number, prev: StockStatus): StockStatus {
  if (qty <= 0) return "out_of_stock";
  if (qty <= 2) return "low_stock";
  if (prev === "made_to_order") return "made_to_order";
  return "in_stock";
}

export default function StockPage() {
  const initial = useMemo<StockRow[]>(
    () =>
      seedProducts.flatMap((p) =>
        p.variants.map((v) => ({
          productName: p.name,
          sku: v.sku,
          variantId: v.id,
          stockQty: v.stockQty,
          stockStatus: v.stockStatus,
        })),
      ),
    [],
  );
  const [rows, setRows] = useState(initial);

  function adjust(variantId: string, delta: number) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.variantId !== variantId) return r;
        const stockQty = Math.max(0, r.stockQty + delta);
        return {
          ...r,
          stockQty,
          stockStatus: deriveStatus(stockQty, r.stockStatus),
        };
      }),
    );
    mockToast("Stock adjusted in memory");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Stock" description="Variant quantities — mock adjustments only." />
      <MockBanner compact />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.variantId}>
                <TableCell className="max-w-[180px] truncate">{r.productName}</TableCell>
                <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {r.stockStatus.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{r.stockQty}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="outline" onClick={() => adjust(r.variantId, -1)}>
                      <Minus className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => adjust(r.variantId, 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

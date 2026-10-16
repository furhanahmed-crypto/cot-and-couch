"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { setVariantStockAction } from "@/app/admin/catalogue/actions";
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

export function AdminStockGrid({ initial }: { initial: StockRow[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();

  function adjust(variantId: string, delta: number) {
    const row = rows.find((r) => r.variantId === variantId);
    if (!row) return;
    const stockQty = Math.max(0, row.stockQty + delta);
    setRows((prev) =>
      prev.map((r) =>
        r.variantId === variantId
          ? {
              ...r,
              stockQty,
              stockStatus: deriveStatus(stockQty, r.stockStatus),
            }
          : r,
      ),
    );
    startTransition(async () => {
      await setVariantStockAction({ variantId, stockQty });
    });
  }

  return (
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
              <TableCell className="max-w-[180px] truncate">
                {r.productName}
              </TableCell>
              <TableCell className="font-mono text-xs">{r.sku}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {r.stockStatus.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{r.stockQty}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={pending}
                    onClick={() => adjust(r.variantId, -1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={pending}
                    onClick={() => adjust(r.variantId, 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

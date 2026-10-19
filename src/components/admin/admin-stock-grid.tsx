"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { setVariantStockAction } from "@/app/admin/catalogue/actions";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockStatus } from "@/types";

export type StockProduct = {
  id: string;
  name: string;
  categoryName: string;
  variants: {
    id: string;
    sku: string;
    label: string;
    stockQty: number;
    stockStatus: StockStatus;
  }[];
};

export function AdminStockGrid({ products }: { products: StockProduct[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [rowsByProduct, setRowsByProduct] = useState(() =>
    Object.fromEntries(
      products.map((p) => [p.id, p.variants.map((v) => ({ ...v }))]),
    ),
  );
  const [pending, startTransition] = useTransition();

  const product = products.find((p) => p.id === productId) ?? products[0];
  const rows = product ? (rowsByProduct[product.id] ?? []) : [];

  const summary = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.stockQty, 0);
    return `${rows.length} SKUs · ${total} units`;
  }, [rows]);

  function setQty(variantId: string, stockQty: number) {
    if (!product) return;
    const qty = Math.max(0, Math.floor(stockQty));
    setRowsByProduct((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] ?? []).map((r) =>
        r.id === variantId ? { ...r, stockQty: qty } : r,
      ),
    }));
    startTransition(async () => {
      const res = await setVariantStockAction({
        variantId,
        productId: product.id,
        stockQty: qty,
      });
      if (!res.ok) {
        toast.error("Could not save stock");
        return;
      }
      toast.success("Stock updated");
    });
  }

  function adjust(variantId: string, delta: number) {
    const row = rows.find((r) => r.id === variantId);
    if (!row) return;
    setQty(variantId, row.stockQty + delta);
  }

  if (!products.length) {
    return (
      <p className="text-sm text-muted-foreground">No published products yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="stock-product">Product</Label>
          <AppSelect
            id="stock-product"
            value={product?.id ?? ""}
            onValueChange={setProductId}
            triggerClassName="w-full max-w-xl"
            items={products.map((p) => ({
              value: p.id,
              label: `${p.categoryName} — ${p.name} (${p.variants.length} SKUs)`,
            }))}
          />
        </div>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="w-28">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-[220px] font-medium">
                  {r.label}
                </TableCell>
                <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {r.stockStatus.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-24"
                    disabled={pending}
                    value={r.stockQty}
                    onChange={(e) => setQty(r.id, Number(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => adjust(r.id, -1)}
                    >
                      −
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => adjust(r.id, 1)}
                    >
                      +
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

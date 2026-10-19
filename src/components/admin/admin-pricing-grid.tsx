"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { setVariantPriceAction } from "@/app/admin/catalogue/actions";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
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
import { discountPercent, formatINR } from "@/lib/format";

export type PricingProduct = {
  id: string;
  name: string;
  categoryName: string;
  variants: {
    id: string;
    sku: string;
    label: string;
    mrp: number;
    price: number;
  }[];
};

export function AdminPricingGrid({ products }: { products: PricingProduct[] }) {
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
    if (!rows.length) return "No variants";
    const prices = rows.map((r) => r.price);
    return `${rows.length} SKUs · from ${formatINR(Math.min(...prices))}`;
  }, [rows]);

  function updatePrice(variantId: string, price: number, mrp: number) {
    if (!product) return;
    setRowsByProduct((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] ?? []).map((r) =>
        r.id === variantId ? { ...r, price } : r,
      ),
    }));
    startTransition(async () => {
      const res = await setVariantPriceAction({
        variantId,
        productId: product.id,
        price: String(price),
        mrp: String(mrp),
      });
      if (!res.ok) {
        toast.error("Could not save price");
        return;
      }
      toast.success("Price updated");
    });
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
          <Label htmlFor="pricing-product">Product</Label>
          <AppSelect
            id="pricing-product"
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
              <TableHead>MRP</TableHead>
              <TableHead>Offer price</TableHead>
              <TableHead>Off</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const off = discountPercent(r.mrp, r.price);
              return (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[220px] font-medium">
                    {r.label}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell>{formatINR(r.mrp)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-28"
                      disabled={pending}
                      value={r.price}
                      onChange={(e) =>
                        updatePrice(r.id, Number(e.target.value) || 0, r.mrp)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {off > 0 ? (
                      <Badge className="bg-brass/15 text-ink hover:bg-brass/15">
                        {off}%
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  This product has no variants.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

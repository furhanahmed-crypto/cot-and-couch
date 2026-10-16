"use client";

import { useMemo, useState } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
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
import { formatINR } from "@/lib/format";

type PriceRow = {
  productName: string;
  sku: string;
  variantId: string;
  mrp: number;
  price: number;
  maxDiscountPercent: number;
};

export default function PricingPage() {
  return (
    <AdminGate title="Pricing">
      <PricingGrid />
    </AdminGate>
  );
}

function PricingGrid() {
  const initial = useMemo<PriceRow[]>(
    () =>
      seedProducts.flatMap((p) =>
        p.variants.map((v) => ({
          productName: p.name,
          sku: v.sku,
          variantId: v.id,
          mrp: v.mrp,
          price: v.price,
          maxDiscountPercent: v.maxDiscountPercent,
        })),
      ),
    [],
  );
  const [rows, setRows] = useState(initial);

  function updatePrice(variantId: string, price: number) {
    setRows((prev) => prev.map((r) => (r.variantId === variantId ? { ...r, price } : r)));
    mockToast("Offer price updated in memory");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pricing" description="Admin-only offer price grid (mock)." />
      <MockBanner compact />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Offer price</TableHead>
              <TableHead>Max discount %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.variantId}>
                <TableCell className="max-w-[180px] truncate">{r.productName}</TableCell>
                <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                <TableCell>{formatINR(r.mrp)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-28"
                    value={r.price}
                    onChange={(e) => updatePrice(r.variantId, Number(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>{r.maxDiscountPercent}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

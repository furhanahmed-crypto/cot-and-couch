"use client";

import { useState, useTransition } from "react";
import { setVariantPriceAction } from "@/app/admin/catalogue/actions";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/format";

type PriceRow = {
  productName: string;
  sku: string;
  variantId: string;
  mrp: number;
  price: number;
  maxDiscountPercent: number;
};

export function AdminPricingGrid({ initial }: { initial: PriceRow[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();

  function updatePrice(variantId: string, price: number) {
    const row = rows.find((r) => r.variantId === variantId);
    if (!row) return;
    setRows((prev) =>
      prev.map((r) => (r.variantId === variantId ? { ...r, price } : r)),
    );
    startTransition(async () => {
      await setVariantPriceAction({
        variantId,
        price: String(price),
        mrp: String(row.mrp),
      });
    });
  }

  return (
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
              <TableCell className="max-w-[180px] truncate">
                {r.productName}
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
                    updatePrice(r.variantId, Number(e.target.value) || 0)
                  }
                />
              </TableCell>
              <TableCell>{r.maxDiscountPercent}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

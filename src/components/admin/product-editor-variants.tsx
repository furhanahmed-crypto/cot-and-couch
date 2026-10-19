"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/format";
import type { Variant } from "@/types";

export function ProductEditorVariants({ variants }: { variants: Variant[] }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-heading text-lg">Variants & pricing</h2>
        <p className="text-sm text-muted-foreground">
          {variants.length} SKUs · edit prices/stock also under Pricing & stock
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                <TableCell className="text-sm">
                  {[v.sizeGroupLabel, v.sizeDimensionLabel, v.thicknessLabel, v.colourName]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </TableCell>
                <TableCell>{formatINR(v.mrp)}</TableCell>
                <TableCell>{formatINR(v.price)}</TableCell>
                <TableCell>{v.stockQty}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {v.stockStatus.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No variants yet — add from Pricing & stock after schema axes land.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

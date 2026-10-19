"use client";

import { useMemo, useState } from "react";
import { AdminProductListRow } from "@/components/admin/admin-product-list-row";
import { AdminProductsCreate } from "@/components/admin/admin-products-create";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category, Product } from "@/types";

export function AdminProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const byCat = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (byCat.get(p.categoryId) ?? "").toLowerCase().includes(q),
    );
  }, [products, query, byCat]);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="min-w-0 max-w-full sm:max-w-sm"
        />
        <div className="ml-auto shrink-0">
          <AdminProductsCreate categories={categories} />
        </div>
      </div>

      <div className="min-w-0 rounded-xl border border-border bg-card">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">From price</TableHead>
              <TableHead className="whitespace-nowrap">Stock</TableHead>
              <TableHead className="sticky right-0 bg-card text-right whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <AdminProductListRow
                key={p.id}
                product={p}
                categoryName={byCat.get(p.categoryId) ?? "—"}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

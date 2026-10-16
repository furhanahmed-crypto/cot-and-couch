"use client";

import { useState } from "react";
import { Archive, Copy } from "lucide-react";
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
import type { Product, ProductStatus } from "@/types";

function statusVariant(status: ProductStatus) {
  if (status === "published") return "default";
  if (status === "draft") return "secondary";
  return "outline";
}

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>(() => [...seedProducts]);

  function duplicate(id: string) {
    const src = rows.find((p) => p.id === id);
    if (!src) return;
    mockToast(`Duplicated “${src.name}” in memory`);
  }

  function archive(id: string) {
    setRows((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "archived" as const } : p)),
    );
    mockToast("Product marked archived in memory");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Catalogue rows from mock seed — actions are in-memory." />
      <MockBanner compact />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(p.status)} className="capitalize">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>{p.variants.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => duplicate(p.id)}>
                      <Copy className="size-3.5" />
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={p.status === "archived"}
                      onClick={() => archive(p.id)}
                    >
                      <Archive className="size-3.5" />
                      Archive
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

"use client";

import { useState } from "react";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reels as seedReels } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import type { Reel } from "@/types";

export default function ReelsPage() {
  const [items, setItems] = useState<Reel[]>(() => [...seedReels].sort((a, b) => a.order - b.order));

  function toggleActive(id: string, active: boolean) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    mockToast(active ? "Reel activated in memory" : "Reel hidden in memory");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reels" description="Toggle which reels appear on the storefront (mock)." />
      <MockBanner compact />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.order}</TableCell>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.tags.join(", ")}</TableCell>
                <TableCell>
                  <Switch checked={r.active} onCheckedChange={(v) => toggleActive(r.id, v)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

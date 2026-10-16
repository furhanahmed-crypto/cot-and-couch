"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { AdminGate } from "@/components/admin/admin-gate";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categories as seedCategories } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import type { Category } from "@/types";

export default function CategoriesPage() {
  return (
    <AdminGate title="Categories">
      <CategoriesContent />
    </AdminGate>
  );
}

function CategoriesContent() {
  const [items, setItems] = useState<Category[]>(() =>
    [...seedCategories].sort((a, b) => a.order - b.order),
  );

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy.map((c, i) => ({ ...c, order: i + 1 }));
    });
    mockToast("Category order updated in memory");
  }

  function toggleVisible(id: string) {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
    );
    mockToast("Visibility toggled in memory");
  }

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Reorder and hide categories (mock)." />
      <MockBanner compact />
      <div className="space-y-4">
        {sorted.map((cat, index) => (
          <Card key={cat.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2 font-heading text-lg">
                  {cat.name}
                  <Badge variant="outline">Order {cat.order}</Badge>
                  {!cat.visible && <Badge variant="secondary">Hidden</Badge>}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{cat.subCategories.length} sub-categories</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => move(cat.id, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === sorted.length - 1}
                  onClick={() => move(cat.id, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => toggleVisible(cat.id)}>
                  {cat.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {cat.subCategories.map((sub) => (
                  <li key={sub.id}>
                    <Badge variant="secondary">{sub.name}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

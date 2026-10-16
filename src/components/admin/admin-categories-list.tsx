"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
  setCategoryActiveAction,
} from "@/app/admin/catalogue/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types";

export function AdminCategoriesList({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(categories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleVisible(id: string) {
    const current = items.find((c) => c.id === id);
    if (!current) return;
    const nextVisible = !current.visible;
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: nextVisible } : c)),
    );
    startTransition(async () => {
      await setCategoryActiveAction({
        categoryId: id,
        isActive: nextVisible,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await createCategoryAction({ name, slug });
            if (!res.ok) setError(res.error);
            else {
              setName("");
              setSlug("");
              router.refresh();
            }
          });
        }}
      >
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              );
            }}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> Add category
        </Button>
      </form>

      {items.map((cat) => (
        <Card key={cat.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <CardTitle className="flex flex-wrap items-center gap-2 font-heading text-lg">
                <Input
                  className="max-w-xs font-heading text-lg"
                  defaultValue={cat.name}
                  disabled={pending}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (!next || next === cat.name) return;
                    startTransition(async () => {
                      await renameCategoryAction({
                        categoryId: cat.id,
                        name: next,
                      });
                      router.refresh();
                    });
                  }}
                />
                <Badge variant="outline">Order {cat.order}</Badge>
                {!cat.visible && <Badge variant="secondary">Hidden</Badge>}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {cat.subCategories.length} sub-categories · {cat.slug}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="outline"
                disabled={pending}
                onClick={() => toggleVisible(cat.id)}
                aria-label={cat.visible ? "Hide" : "Show"}
              >
                {cat.visible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const res = await deleteCategoryAction(cat.id);
                    if (!res.ok) setError(res.error);
                    else router.refresh();
                  });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

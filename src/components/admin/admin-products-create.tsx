"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createProductAction } from "@/app/admin/catalogue/product-actions";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types";

type BedRangeOption = { id: string; name: string };

export function AdminProductsCreate({
  categories,
  bedRanges = [],
}: {
  categories: Category[];
  bedRanges?: BedRangeOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [bedRangeId, setBedRangeId] = useState(bedRanges[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );
  const isBeds = selectedCat?.slug === "cots";

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createProductAction({
        categoryId,
        name,
        slug,
        bedRangeId: isBeds ? bedRangeId || null : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setName("");
      setSlug("");
      router.push(ROUTES.admin.productEdit(res.id));
    });
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add product
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New product draft</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="space-y-1">
              <Label htmlFor="np-name">Name</Label>
              <Input
                id="np-name"
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
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="np-slug">Slug</Label>
              <Input id="np-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="np-cat">Category</Label>
              <AppSelect
                id="np-cat"
                value={categoryId}
                onValueChange={setCategoryId}
                triggerClassName="w-full"
                items={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>
            {isBeds ? (
              <div className="space-y-1">
                <Label htmlFor="np-range">Cot range</Label>
                <AppSelect
                  id="np-range"
                  value={bedRangeId}
                  onValueChange={setBedRangeId}
                  triggerClassName="w-full"
                  items={bedRanges.map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                  placeholder="Select range"
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={submit}>
              {pending ? "Creating…" : "Create draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

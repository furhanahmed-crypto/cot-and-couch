"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBedRangeAction,
  deleteBedRangeAction,
} from "@/app/admin/categories/bed-actions";
import { BedRangeEditorSheet } from "@/components/admin/bed-range-editor-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminBedRange } from "@/services/admin-categories";

export function BedsCategorySection({
  categoryName,
  visible,
  pending,
  bedRanges,
  widthOptions,
  onRenameCategory,
  onToggleVisible,
}: {
  categoryId: string;
  categoryName: string;
  visible: boolean;
  pending: boolean;
  bedRanges: AdminBedRange[];
  widthOptions: {
    id: string;
    label: string;
    detail?: string | null;
    isActive?: boolean;
  }[];
  onRenameCategory: (name: string) => void;
  onToggleVisible: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(categoryName);
  const [rangeName, setRangeName] = useState("");
  const [editing, setEditing] = useState<AdminBedRange | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!editing) return;
    const fresh = bedRanges.find((r) => r.id === editing.id);
    if (fresh) setEditing(fresh);
  }, [bedRanges, editing?.id]);

  function refresh() {
    router.refresh();
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim() && name.trim() !== categoryName) {
                  onRenameCategory(name.trim());
                }
              }}
              className="max-w-xs font-heading text-lg font-medium"
            />
            <Badge variant="outline">cots</Badge>
            {!visible ? <Badge variant="secondary">Hidden</Badge> : null}
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onToggleVisible}>
          {visible ? "Visible" : "Hidden"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Bed ranges and the shared widths each range uses. Edit a range to rename
        it and manage width options.
      </p>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await createBedRangeAction({ name: rangeName });
            if (!res.ok) toast.error(res.error);
            else {
              toast.success("Range added");
              setRangeName("");
              refresh();
            }
          });
        }}
      >
        <div className="min-w-[12rem] flex-1 space-y-1">
          <Label htmlFor="new-range">Add range</Label>
          <Input
            id="new-range"
            value={rangeName}
            onChange={(e) => setRangeName(e.target.value)}
            placeholder="e.g. Ideal Range"
          />
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          <Plus className="size-3.5" />
          Add range
        </Button>
      </form>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {bedRanges.map((range) => (
          <div
            key={range.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-background px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{range.name}</p>
              <p className="text-xs text-muted-foreground">
                {widthOptions.length} widths shared
                {range.collectionLabels.length
                  ? ` · ${range.collectionLabels.join(", ")}`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={`Edit ${range.name}`}
                onClick={() => setEditing(range)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="text-destructive"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await deleteBedRangeAction(range.id);
                    toast.success("Range archived");
                    refresh();
                  });
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <BedRangeEditorSheet
        open={Boolean(editing)}
        range={editing}
        widthOptions={widthOptions}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={refresh}
      />
    </section>
  );
}

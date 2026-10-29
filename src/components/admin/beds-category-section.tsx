"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBedRangeAction,
  deleteBedRangeAction,
  updateBedRangeAction,
} from "@/app/admin/categories/bed-actions";
import { BedWidthOptionsSheet } from "@/components/admin/bed-width-options-sheet";
import { Badge } from "@/components/ui/badge";
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
import type { AdminBedRange } from "@/services/admin-categories";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export function BedsCategorySection({
  categoryId,
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
  widthOptions: { id: string; label: string; detail?: string | null }[];
  onRenameCategory: (name: string) => void;
  onToggleVisible: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(categoryName);
  const [rangeName, setRangeName] = useState("");
  const [widthSheetOpen, setWidthSheetOpen] = useState(false);
  const [editRange, setEditRange] = useState<AdminBedRange | null>(null);
  const [editName, setEditName] = useState("");
  const [, startTransition] = useTransition();

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
        Eight bed ranges (products). Shared widths apply to every range; set prices
        per product in the editor.
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
                Range {range.rangeNumber} · {range.variantCount} variants
                {range.collectionLabels.length
                  ? ` · ${range.collectionLabels.join(", ")}`
                  : ""}
              </p>
              <Link
                href={ROUTES.admin.productEdit(range.id)}
                className="text-xs text-primary hover:underline"
              >
                Open product
              </Link>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={`Edit ${range.name}`}
                onClick={() => {
                  setEditRange(range);
                  setEditName(range.name);
                }}
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setWidthSheetOpen(true)}
        >
          <Pencil className="size-3.5" />
          Manage bed widths ({widthOptions.length})
        </Button>
        <p className="text-xs text-muted-foreground">
          Tag Royal Range / Victoria collections on individual products.
        </p>
      </div>

      <BedWidthOptionsSheet
        open={widthSheetOpen}
        onOpenChange={setWidthSheetOpen}
        options={widthOptions}
        pending={pending}
        onSaved={refresh}
      />

      <Dialog open={Boolean(editRange)} onOpenChange={(o) => !o && setEditRange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename range</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditRange(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !editName.trim()}
              onClick={() => {
                if (!editRange) return;
                startTransition(async () => {
                  const res = await updateBedRangeAction({
                    id: editRange.id,
                    name: editName,
                  });
                  if (!res.ok) toast.error(res.error);
                  else {
                    toast.success("Range updated");
                    setEditRange(null);
                    refresh();
                  }
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBedWidthOptionAction,
  updateBedRangeAction,
  updateBedWidthOptionAction,
} from "@/app/admin/categories/bed-actions";
import { deleteCategoryConfigOptionAction } from "@/app/admin/categories/actions";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AdminBedRange } from "@/services/admin-categories";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

type WidthOption = {
  id: string;
  label: string;
  detail?: string | null;
  isActive?: boolean;
};

export function BedRangeEditorSheet({
  open,
  range,
  widthOptions,
  pending,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  range: AdminBedRange | null;
  widthOptions: WidthOption[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [widthModal, setWidthModal] = useState<
    | { mode: "add" }
    | { mode: "edit"; id: string; name: string; size: string; isActive: boolean }
    | null
  >(null);
  const [widthName, setWidthName] = useState("");
  const [widthSize, setWidthSize] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (range) setName(range.name);
  }, [range]);

  useEffect(() => {
    if (widthModal?.mode === "edit") {
      setWidthName(widthModal.name);
      setWidthSize(widthModal.size);
    } else if (widthModal?.mode === "add") {
      setWidthName("");
      setWidthSize("");
    }
  }, [widthModal]);

  function saveRange() {
    if (!range) return;
    startTransition(async () => {
      const res = await updateBedRangeAction({ id: range.id, name });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Range saved");
        onOpenChange(false);
        onSaved();
      }
    });
  }

  function saveWidthModal() {
    startTransition(async () => {
      if (widthModal?.mode === "add") {
        const res = await createBedWidthOptionAction({
          name: widthName,
          size: widthSize,
        });
        if (!res.ok) toast.error(res.error);
        else {
          toast.success("Width added");
          setWidthModal(null);
          onSaved();
        }
        return;
      }
      if (widthModal?.mode === "edit") {
        const res = await updateBedWidthOptionAction({
          id: widthModal.id,
          name: widthName,
          size: widthSize,
          isActive: widthModal.isActive,
        });
        if (!res.ok) toast.error(res.error);
        else {
          toast.success("Width updated");
          setWidthModal(null);
          onSaved();
        }
      }
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{range?.name ?? "Range"} options</SheetTitle>
            <SheetDescription>
              Rename this range, then manage shared bed widths. Widths apply to
              every range product.
            </SheetDescription>
          </SheetHeader>

          {range ? (
            <div className="space-y-5 px-4 pb-4">
              <div className="space-y-1">
                <Label htmlFor="bed-range-name">Range name</Label>
                <Input
                  id="bed-range-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Range {range.rangeNumber}
                  {range.collectionLabels.length
                    ? ` · ${range.collectionLabels.join(", ")}`
                    : ""}
                  {" · "}
                  <Link
                    href={ROUTES.admin.productEdit(range.id)}
                    className="text-primary hover:underline"
                  >
                    Open product editor
                  </Link>
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 p-3">
                <div>
                  <p className="text-sm font-medium">Bed widths (shared)</p>
                  <p className="text-xs text-muted-foreground">
                    Name and size for each width. Changes apply to all ranges.
                  </p>
                </div>

                <ul className="space-y-2">
                  {widthOptions.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{o.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {o.detail ?? "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          aria-label={`Edit ${o.label}`}
                          onClick={() =>
                            setWidthModal({
                              mode: "edit",
                              id: o.id,
                              name: o.label,
                              size: o.detail ?? "",
                              isActive: o.isActive ?? true,
                            })
                          }
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
                              const res = await deleteCategoryConfigOptionAction(
                                o.id,
                              );
                              if (!res.ok) toast.error(res.error);
                              else {
                                toast.success("Width removed");
                                onSaved();
                              }
                            });
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setWidthModal({ mode: "add" })}
                >
                  <Plus className="size-3.5" />
                  Add width
                </Button>
              </div>
            </div>
          ) : null}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !range || !name.trim()}
              onClick={saveRange}
            >
              {pending ? "Saving…" : "Save range"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(widthModal)}
        onOpenChange={(o) => !o && setWidthModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {widthModal?.mode === "add" ? "Add bed width" : "Edit bed width"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={widthName}
                onChange={(e) => setWidthName(e.target.value)}
                placeholder="e.g. Queen Size"
              />
            </div>
            <div className="space-y-1">
              <Label>Size</Label>
              <Input
                value={widthSize}
                onChange={(e) => setWidthSize(e.target.value)}
                placeholder="e.g. 5 ft × 6 ft"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setWidthModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !widthName.trim() || !widthSize.trim()}
              onClick={saveWidthModal}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

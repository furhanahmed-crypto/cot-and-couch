"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBedWidthOptionAction,
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type WidthOption = {
  id: string;
  label: string;
  detail?: string | null;
  isActive?: boolean;
};

export function BedWidthOptionsSheet({
  open,
  onOpenChange,
  options,
  pending,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: WidthOption[];
  pending: boolean;
  onSaved: () => void;
}) {
  const [modal, setModal] = useState<
    | { mode: "add" }
    | { mode: "edit"; id: string; name: string; size: string; isActive: boolean }
    | null
  >(null);
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (modal?.mode === "edit") {
      setName(modal.name);
      setSize(modal.size);
    } else if (modal?.mode === "add") {
      setName("");
      setSize("");
    }
  }, [modal]);

  function saveModal() {
    startTransition(async () => {
      if (modal?.mode === "add") {
        const res = await createBedWidthOptionAction({ name, size });
        if (!res.ok) toast.error(res.error);
        else {
          toast.success("Width added");
          setModal(null);
          onSaved();
        }
        return;
      }
      if (modal?.mode === "edit") {
        const res = await updateBedWidthOptionAction({
          id: modal.id,
          name,
          size,
          isActive: modal.isActive,
        });
        if (!res.ok) toast.error(res.error);
        else {
          toast.success("Width updated");
          setModal(null);
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
            <SheetTitle>Bed widths</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Shared across all ranges. Each width has a name and size shown on the
              storefront.
            </p>
            <Button type="button" size="sm" onClick={() => setModal({ mode: "add" })}>
              <Plus className="size-3.5" />
              Add width
            </Button>
            <ul className="space-y-2">
              {options.map((o) => (
                <li
                  key={o.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border/70 px-3 py-2.5"
                >
                  <div>
                    <p className="font-medium">{o.label}</p>
                    <p className="text-sm text-muted-foreground">{o.detail ?? "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Edit ${o.label}`}
                      onClick={() =>
                        setModal({
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
                          const res = await deleteCategoryConfigOptionAction(o.id);
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
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(modal)} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal?.mode === "add" ? "Add bed width" : "Edit bed width"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Queen Size"
              />
            </div>
            <div className="space-y-1">
              <Label>Size</Label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 5 ft × 6 ft"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !name.trim() || !size.trim()}
              onClick={saveModal}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

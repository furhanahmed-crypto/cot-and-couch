"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImageOff } from "lucide-react";
import { deleteMediaAction, moveMediaAction, setMediaPublishedAction } from "@/app/admin/media/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Switch } from "@/components/ui/switch";
import { useActionToast } from "@/hooks/use-action-toast";
import type { MediaAdminItem } from "@/types/admin-content";

type MediaCardProps = {
  item: MediaAdminItem;
  /** One line under the title, e.g. "Miyapur · Sep 2026". */
  details: string;
  isFirst: boolean;
  isLast: boolean;
  /** The edit dialog for this item. */
  renderEditDialog: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
};

/** Image, title, Published switch, move up / down, Edit, Delete. */
export function MediaCard({ item, details, isFirst, isLast, renderEditDialog }: MediaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { run, isPending } = useActionToast();
  const label = item.title || "this item";

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border/60">
      <div className="relative aspect-[4/3] bg-muted">
        {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" unoptimized /> : <ImageOff className="m-auto size-6 text-muted-foreground/50" />}
      </div>
      <div className="space-y-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={item.title ?? undefined}>{item.title || "Untitled"}</p>
          <p className="truncate text-xs text-muted-foreground">{details || "—"}</p>
        </div>
        <label className="flex items-center justify-between gap-2 text-sm">
          Published
          <Switch
            checked={item.isPublished}
            disabled={isPending}
            onCheckedChange={(isPublished) =>
              run(() => setMediaPublishedAction(item.id, isPublished), { loading: "Saving…", success: isPublished ? "Published" : "Hidden from the shop", error: "Could not change it" })
            }
          />
        </label>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${label} up`} disabled={isFirst || isPending} onClick={() => run(() => moveMediaAction(item.id, "up"), { loading: "Moving…", success: "Moved up", error: "Could not move it" })}>
            <ArrowUp className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${label} down`} disabled={isLast || isPending} onClick={() => run(() => moveMediaAction(item.id, "down"), { loading: "Moving…", success: "Moved down", error: "Could not move it" })}>
            <ArrowDown className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditing(true)}>Edit</Button>
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setIsDeleting(true)}>Delete</Button>
        </div>
      </div>
      {renderEditDialog(isEditing, setIsEditing)}
      <ConfirmationModal
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Delete ${label}?`}
        description="It is removed from the shop. This cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={() => run(() => deleteMediaAction(item.id), { loading: "Deleting…", success: "Deleted", error: "Could not delete it" }, () => setIsDeleting(false))}
      />
    </div>
  );
}

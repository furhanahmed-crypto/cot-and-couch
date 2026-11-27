"use client";

import { useState } from "react";
import { deleteColourAction, updateColourAction } from "@/app/admin/colours/actions";
import { RowActions } from "@/components/admin/common/row-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ColourAdminRow } from "@/types/admin-catalogue";
import { ColourFormDialog } from "./colour-form-dialog";

export function ColourRowActions({ colour }: { colour: ColourAdminRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "deactivate" | null>(null);
  const { run, isPending } = useActionToast();

  function setActive(isActive: boolean) {
    const input = { name: colour.name, hex: colour.hex, isActive, sortOrder: colour.sortOrder };
    run(
      () => updateColourAction(colour.id, input),
      { loading: "Saving…", success: isActive ? "Colour activated" : "Colour deactivated", error: "Could not save the colour" },
      () => setConfirm(null),
    );
  }

  function remove() {
    run(
      () => deleteColourAction(colour.id),
      { loading: "Deleting colour…", success: "Colour deleted", error: "Could not delete the colour" },
      () => setConfirm(null),
    );
  }

  return (
    <>
      <RowActions
        label={colour.name}
        actions={[
          { label: "Edit", onSelect: () => setIsEditing(true) },
          colour.isActive
            ? { label: "Deactivate", onSelect: () => setConfirm("deactivate") }
            : { label: "Activate", onSelect: () => setActive(true) },
          { label: "Delete", onSelect: () => setConfirm("delete"), isDestructive: true },
        ]}
      />
      <ColourFormDialog key={`${colour.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} colour={colour} />
      <ConfirmationModal
        open={confirm === "deactivate"}
        onOpenChange={(open) => setConfirm(open ? "deactivate" : null)}
        title={`Deactivate ${colour.name}?`}
        description="It stays on existing variants, but cannot be chosen for new ones."
        confirmLabel="Deactivate"
        destructive={false}
        pending={isPending}
        onConfirm={() => setActive(false)}
      />
      <ConfirmationModal
        open={confirm === "delete"}
        onOpenChange={(open) => setConfirm(open ? "delete" : null)}
        title={`Delete ${colour.name}?`}
        description="This cannot be undone. Colours used by products cannot be deleted; deactivate them instead."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

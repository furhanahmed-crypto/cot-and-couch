"use client";

import { useState } from "react";
import { deleteVariantAction, setVariantActiveAction } from "@/app/admin/products/variant-actions";
import { RowActions, type RowAction } from "@/components/admin/common/row-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Switch } from "@/components/ui/switch";
import { useActionToast } from "@/hooks/use-action-toast";
import type { VariantAdminRow } from "@/types/admin-products";
import { VariantFormDialog } from "./variant-form-dialog";
import type { VariantEditorContext } from "./variants-tab";

export function VariantActiveSwitch({ variant }: { variant: VariantAdminRow }) {
  const { run, isPending } = useActionToast();

  function change(isActive: boolean) {
    run(() => setVariantActiveAction(variant.id, isActive), {
      loading: "Saving…",
      success: isActive ? "Variant activated" : "Variant deactivated",
      error: "Could not change the variant",
    });
  }

  return <Switch size="sm" aria-label={`Active: ${variant.sku}`} checked={variant.isActive} disabled={isPending} onCheckedChange={change} />;
}

export function VariantRowActions({ variant, context }: { variant: VariantAdminRow; context: VariantEditorContext }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, isPending } = useActionToast();

  function remove() {
    run(() => deleteVariantAction(variant.id), { loading: "Deleting variant…", success: "Variant deleted", error: "Could not delete the variant" }, () =>
      setIsConfirmingDelete(false),
    );
  }

  const actions: RowAction[] = [{ label: "Edit", onSelect: () => setIsEditing(true) }];
  if (context.canDelete) actions.push({ label: "Delete", onSelect: () => setIsConfirmingDelete(true), isDestructive: true });

  return (
    <>
      <RowActions label={variant.sku} actions={actions} />
      <VariantFormDialog key={`${variant.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} context={context} variant={variant} />
      <ConfirmationModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete ${variant.sku}?`}
        description="It is removed from carts. Variants in orders cannot be deleted: switch them off instead. This cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

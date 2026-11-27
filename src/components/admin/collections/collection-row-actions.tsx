"use client";

import { useState } from "react";
import { deleteCollectionAction } from "@/app/admin/collections/actions";
import { RowActions } from "@/components/admin/common/row-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ROUTES } from "@/constants/routes";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CollectionAdminRow } from "@/types/admin-catalogue";
import { CollectionFormDialog } from "./collection-form-dialog";

export function CollectionRowActions({ collection }: { collection: CollectionAdminRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, isPending } = useActionToast();

  function remove() {
    run(
      () => deleteCollectionAction(collection.id),
      { loading: "Deleting collection…", success: "Collection deleted", error: "Could not delete the collection" },
      () => setIsConfirmingDelete(false),
    );
  }

  return (
    <>
      <RowActions
        label={collection.name}
        actions={[
          { label: "Edit", onSelect: () => setIsEditing(true) },
          { label: "View in shop", href: ROUTES.collection(collection.slug) },
          { label: "Delete", onSelect: () => setIsConfirmingDelete(true), isDestructive: true },
        ]}
      />
      <CollectionFormDialog key={`${collection.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} collection={collection} />
      <ConfirmationModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete ${collection.name}?`}
        description={`The ${collection.productCount} products in it are kept; only the collection is removed. This cannot be undone.`}
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

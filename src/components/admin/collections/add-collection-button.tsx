"use client";

import { AddButton } from "@/components/admin/common/add-button";
import { CollectionFormDialog } from "./collection-form-dialog";

export function AddCollectionButton() {
  return (
    <AddButton
      label="Add collection"
      renderDialog={(open, onOpenChange) => <CollectionFormDialog open={open} onOpenChange={onOpenChange} />}
    />
  );
}

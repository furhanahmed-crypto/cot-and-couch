"use client";

import { AddButton } from "@/components/admin/common/add-button";
import { ColourFormDialog } from "./colour-form-dialog";

export function AddColourButton() {
  return (
    <AddButton
      label="Add colour"
      renderDialog={(open, onOpenChange) => <ColourFormDialog open={open} onOpenChange={onOpenChange} />}
    />
  );
}

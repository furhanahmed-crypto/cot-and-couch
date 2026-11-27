"use client";

import { useState } from "react";
import { createColourAction, updateColourAction } from "@/app/admin/colours/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ColourAdminRow } from "@/types/admin-catalogue";

type ColourFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this colour; omit to add a new one. */
  colour?: ColourAdminRow;
};

const NEW_COLOUR = { name: "", hex: "#C19A6B", isActive: true, sortOrder: "0" };

export function ColourFormDialog({ open, onOpenChange, colour }: ColourFormDialogProps) {
  const [form, setForm] = useState(
    colour ? { name: colour.name, hex: colour.hex, isActive: colour.isActive, sortOrder: String(colour.sortOrder) } : NEW_COLOUR,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function save() {
    const input = { ...form };
    run(
      () => (colour ? updateColourAction(colour.id, input) : createColourAction(input)),
      { loading: "Saving colour…", success: colour ? "Colour saved" : "Colour added", error: "Could not save the colour" },
      () => {
        setErrors({});
        onOpenChange(false);
        if (!colour) setForm(NEW_COLOUR);
      },
      setErrors,
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={colour ? "Edit colour" : "Add colour"}
      description="Wood finish or fabric colour used by product variants."
      submitLabel={colour ? "Save colour" : "Add colour"}
      isPending={isPending}
      onSubmit={save}
    >
      <FormField id="colour-name" label="Name" error={errors.name}>
        <Input id="colour-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </FormField>
      <FormField id="colour-hex" label="Colour" help="Pick the colour or type it, e.g. #C19A6B." error={errors.hex}>
        <div className="flex gap-2">
          <input
            type="color"
            aria-label="Pick colour"
            value={/^#[0-9A-Fa-f]{6}$/.test(form.hex) ? form.hex : "#000000"}
            onChange={(event) => setForm({ ...form, hex: event.target.value.toUpperCase() })}
            className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
          />
          <Input id="colour-hex" value={form.hex} aria-invalid={Boolean(errors.hex)} onChange={(event) => setForm({ ...form, hex: event.target.value })} />
        </div>
      </FormField>
      <FormField id="colour-order" label="Order" help="Lower numbers show first." error={errors.sortOrder}>
        <Input id="colour-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField
        id="colour-active"
        label="Active"
        help="Inactive colours cannot be chosen for new variants."
        checked={form.isActive}
        onCheckedChange={(isActive) => setForm({ ...form, isActive })}
      />
    </FormDialog>
  );
}

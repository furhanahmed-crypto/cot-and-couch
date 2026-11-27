"use client";

import { useState } from "react";
import { createQualityAction, updateQualityAction } from "@/app/admin/categories/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { QualityAdminRow } from "@/types/admin-catalogue";

type QualityFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; categoryId: string; quality?: QualityAdminRow };

function toForm(quality?: QualityAdminRow) {
  return {
    name: quality?.name ?? "",
    description: quality?.description ?? "",
    warrantyYears: quality?.warrantyYears ? String(quality.warrantyYears) : "",
    isActive: quality?.isActive ?? true,
    sortOrder: String(quality?.sortOrder ?? 0),
  };
}

export function QualityFormDialog({ open, onOpenChange, categoryId, quality }: QualityFormDialogProps) {
  const [form, setForm] = useState(() => toForm(quality));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function save() {
    const input = { ...form, categoryId };
    run(
      () => (quality ? updateQualityAction(quality.id, input) : createQualityAction(input)),
      { loading: "Saving quality…", success: quality ? "Quality saved" : "Quality added", error: "Could not save the quality" },
      () => {
        onOpenChange(false);
        if (!quality) setForm(toForm());
      },
      setErrors,
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={quality ? "Edit quality" : "Add quality"}
      description="The client's quality name, e.g. Ideal Range or Premium."
      submitLabel={quality ? "Save quality" : "Add quality"}
      isPending={isPending}
      onSubmit={save}
    >
      <FormField id="quality-name" label="Name" error={errors.name}>
        <Input id="quality-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </FormField>
      <FormField id="quality-description" label="Body / construction" help="Shown on the product page." error={errors.description}>
        <Textarea id="quality-description" rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="quality-warranty" label="Warranty (years)" help="Leave empty if not given." error={errors.warrantyYears}>
          <Input id="quality-warranty" type="number" min={1} value={form.warrantyYears} onChange={(event) => setForm({ ...form, warrantyYears: event.target.value })} />
        </FormField>
        <FormField id="quality-order" label="Order" error={errors.sortOrder}>
          <Input id="quality-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
        </FormField>
      </div>
      <ActiveSwitchField id="quality-active" label="Active" help="Inactive qualities cannot be chosen for new variants." checked={form.isActive} onCheckedChange={(isActive) => setForm({ ...form, isActive })} />
    </FormDialog>
  );
}

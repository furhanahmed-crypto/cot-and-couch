"use client";

import { useState } from "react";
import { createBrandAction, updateBrandAction } from "@/app/admin/categories/brand-actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { BrandAdminRow } from "@/types/admin-catalogue";

type BrandFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; categoryId: string; brand?: BrandAdminRow };

function toForm(brand?: BrandAdminRow) {
  return { name: brand?.name ?? "", isActive: brand?.isActive ?? true, sortOrder: String(brand?.sortOrder ?? 0) };
}

export function BrandFormDialog({ open, onOpenChange, categoryId, brand }: BrandFormDialogProps) {
  const [form, setForm] = useState(() => toForm(brand));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function save() {
    const input = { ...form, categoryId };
    run(
      () => (brand ? updateBrandAction(brand.id, input) : createBrandAction(input)),
      { loading: "Saving brand…", success: brand ? "Brand saved" : "Brand added", error: "Could not save the brand" },
      () => {
        onOpenChange(false);
        if (!brand) setForm(toForm());
      },
      setErrors,
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={brand ? "Edit brand" : "Add brand"}
      submitLabel={brand ? "Save brand" : "Add brand"}
      isPending={isPending}
      onSubmit={save}
    >
      <FormField id="brand-name" label="Name" error={errors.name}>
        <Input id="brand-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </FormField>
      <FormField id="brand-order" label="Order" help="Lower numbers show first." error={errors.sortOrder}>
        <Input id="brand-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField id="brand-active" label="Active" help="Inactive brands cannot be chosen for new products." checked={form.isActive} onCheckedChange={(isActive) => setForm({ ...form, isActive })} />
    </FormDialog>
  );
}

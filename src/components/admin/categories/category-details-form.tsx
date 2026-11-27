"use client";

import { useState } from "react";
import { updateCategoryAction } from "@/app/admin/categories/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormField } from "@/components/admin/common/form-field";
import { SaveBar } from "@/components/admin/common/save-bar";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CategoryAdminRow } from "@/types/admin-catalogue";

function toForm(category: CategoryAdminRow) {
  return { name: category.name, isActive: category.isActive, sortOrder: String(category.sortOrder) };
}

export function CategoryDetailsForm({ category }: { category: CategoryAdminRow }) {
  const [saved, setSaved] = useState(() => toForm(category));
  const [form, setForm] = useState(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function save() {
    run(
      () => updateCategoryAction(category.id, form),
      { loading: "Saving category…", success: "Category saved", error: "Could not save the category" },
      () => {
        setSaved(form);
        setErrors({});
      },
      setErrors,
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <FormField id="category-name" label="Name" help="The shop shows Cots as “Beds”." error={errors.name}>
        <Input id="category-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </FormField>
      <FormField id="category-slug" label="Slug" help="Fixed: the site's links and code depend on it.">
        <Input id="category-slug" value={category.slug} disabled />
      </FormField>
      <FormField id="category-order" label="Order" help="Lower numbers show first in the shop menu." error={errors.sortOrder}>
        <Input id="category-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField
        id="category-active"
        label="Active"
        help="Inactive categories and their products are hidden in the shop."
        checked={form.isActive}
        onCheckedChange={(isActive) => setForm({ ...form, isActive })}
      />
      <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setForm(saved)} />
    </div>
  );
}

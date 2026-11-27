"use client";

import { useState } from "react";
import { createAddonAction, updateAddonAction } from "@/app/admin/categories/addon-actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AddonKind, PriceUnit } from "@/constants/products";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import type { AddonAdminRow } from "@/types/admin-catalogue";

export type AddonScope = {
  categoryId: string;
  /** Set for one product's add-ons (sofas); null for the whole category (cots). */
  productId: string | null;
  /** Sizes this add-on can be limited to (cots: King storage). Empty = no size choice. */
  sizeLabels: string[];
};

type AddonFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; scope: AddonScope; addon?: AddonAdminRow };

function ChoiceButtons<T extends string>(props: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="space-y-2">
      <Label>{props.label}</Label>
      <div className="flex flex-wrap gap-2">
        {props.options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={props.value === option.value}
            onClick={() => props.onChange(option.value)}
            className={cn("rounded-md border px-3 py-1.5 text-sm", props.value === option.value ? "border-foreground bg-foreground text-background" : "border-border")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddonFormDialog({ open, onOpenChange, scope, addon }: AddonFormDialogProps) {
  const emptyForm = { name: "", kind: "addon" as AddonKind, priceUnit: "fixed" as PriceUnit, sizeLabel: "", isActive: true, sortOrder: "0" };
  const [form, setForm] = useState(
    addon
      ? { name: addon.name, kind: addon.kind, priceUnit: addon.priceUnit, sizeLabel: addon.sizeLabel ?? "", isActive: addon.isActive, sortOrder: String(addon.sortOrder) }
      : emptyForm,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const isProductAddon = scope.productId !== null;

  function save() {
    const input = { ...form, categoryId: scope.categoryId, productId: scope.productId };
    run(
      () => (addon ? updateAddonAction(addon.id, input) : createAddonAction(input)),
      { loading: "Saving add-on…", success: addon ? "Add-on saved" : "Add-on added. Now set its prices.", error: "Could not save the add-on" },
      () => {
        onOpenChange(false);
        if (!addon) setForm(emptyForm);
      },
      setErrors,
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={addon ? "Edit add-on" : "Add add-on"}
      description="Set the price per quality in the price grid. A quality with no price does not offer this add-on."
      submitLabel={addon ? "Save add-on" : "Add add-on"}
      isPending={isPending}
      onSubmit={save}
    >
      <FormField id="addon-name" label="Name" error={errors.name}>
        <Input id="addon-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </FormField>
      {isProductAddon ? (
        <>
          <ChoiceButtons label="Shown as" value={form.kind} onChange={(kind) => setForm({ ...form, kind })} options={[{ value: "addon", label: "Additional option" }, { value: "recliner", label: "Recliner" }]} />
          <ChoiceButtons label="Price is" value={form.priceUnit} onChange={(priceUnit) => setForm({ ...form, priceUnit })} options={[{ value: "fixed", label: "One price" }, { value: "per_seat", label: "Per seat" }]} />
        </>
      ) : null}
      {scope.sizeLabels.length ? (
        <ChoiceButtons
          label="Only for size"
          value={form.sizeLabel}
          onChange={(sizeLabel) => setForm({ ...form, sizeLabel })}
          options={[{ value: "", label: "All sizes" }, ...scope.sizeLabels.map((size) => ({ value: size, label: size }))]}
        />
      ) : null}
      <FormField id="addon-order" label="Order" help="Lower numbers show first." error={errors.sortOrder}>
        <Input id="addon-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField id="addon-active" label="Active" help="Inactive add-ons are hidden in the shop and dropped from carts." checked={form.isActive} onCheckedChange={(isActive) => setForm({ ...form, isActive })} />
    </FormDialog>
  );
}

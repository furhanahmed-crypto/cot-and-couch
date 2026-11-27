"use client";

import { useState } from "react";
import { createVariantAction, updateVariantAction } from "@/app/admin/products/variant-actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { MoneyInput } from "@/components/admin/common/money-input";
import { OptionSelect } from "@/components/admin/common/option-select";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { VariantAdminRow } from "@/types/admin-products";
import type { VariantEditorContext } from "./variants-tab";

type VariantFormDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; context: VariantEditorContext; variant?: VariantAdminRow };

const text = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));

function toForm(variant?: VariantAdminRow) {
  return {
    sizeLabel: variant?.sizeLabel ?? "", lengthIn: text(variant?.lengthIn), widthIn: text(variant?.widthIn),
    thicknessIn: text(variant?.thicknessIn), seats: text(variant?.seats), qualityId: variant?.qualityId ?? "",
    colourId: variant?.colourId ?? "", mrp: text(variant?.mrp), price: text(variant?.price), isActive: variant?.isActive ?? true,
  };
}

export function VariantFormDialog({ open, onOpenChange, context, variant }: VariantFormDialogProps) {
  const [form, setForm] = useState(() => toForm(variant));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const { fields } = context;
  const update = (changes: Partial<typeof form>) => setForm({ ...form, ...changes });
  // New variants may only use active qualities and colours; an existing variant keeps its own.
  const qualities = context.qualities.filter((quality) => quality.isActive || quality.id === variant?.qualityId);
  const colours = context.colours.filter((colour) => colour.isActive || colour.id === variant?.colourId);

  function save() {
    const input = { ...form, productId: context.productId };
    run(
      () => (variant ? updateVariantAction(variant.id, input) : createVariantAction(input)),
      { loading: "Saving variant…", success: variant ? "Variant saved" : "Variant added", error: "Could not save the variant" },
      () => {
        onOpenChange(false);
        if (!variant) setForm(toForm());
      },
      setErrors,
    );
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={variant ? `Edit ${variant.sku}` : "Add variant"} submitLabel={variant ? "Save variant" : "Add variant"} isPending={isPending} onSubmit={save}>
      <FormField id="variant-size" label="Size" help="As the client writes it, e.g. King, Queen, 3+1+1 / 3+2." error={errors.sizeLabel}>
        <Input id="variant-size" value={form.sizeLabel} aria-invalid={Boolean(errors.sizeLabel)} onChange={(event) => update({ sizeLabel: event.target.value })} />
      </FormField>
      {fields.dimensions ? (
        <div className="grid grid-cols-2 gap-4">
          <FormField id="variant-length" label="Length (in)" error={errors.lengthIn}>
            <Input id="variant-length" type="number" min={1} value={form.lengthIn} onChange={(event) => update({ lengthIn: event.target.value })} />
          </FormField>
          <FormField id="variant-width" label="Width (in)" error={errors.widthIn}>
            <Input id="variant-width" type="number" min={1} value={form.widthIn} onChange={(event) => update({ widthIn: event.target.value })} />
          </FormField>
        </div>
      ) : null}
      {fields.thickness ? (
        <FormField id="variant-thickness" label="Thickness (in)" error={errors.thicknessIn}>
          <Input id="variant-thickness" type="number" min={1} value={form.thicknessIn} onChange={(event) => update({ thicknessIn: event.target.value })} />
        </FormField>
      ) : null}
      {fields.seats ? (
        <FormField id="variant-seats" label="Seats" help="Needed for per-seat recliner prices. Empty for e.g. 3 + lounger." error={errors.seats}>
          <Input id="variant-seats" type="number" min={1} value={form.seats} onChange={(event) => update({ seats: event.target.value })} />
        </FormField>
      ) : null}
      {qualities.length ? (
        <FormField id="variant-quality" label="Quality" error={errors.qualityId}>
          <OptionSelect id="variant-quality" value={form.qualityId} noneLabel="No quality" options={qualities.map((quality) => ({ value: quality.id, label: quality.name }))} onChange={(qualityId) => update({ qualityId })} />
        </FormField>
      ) : null}
      {fields.colour && colours.length ? (
        <FormField id="variant-colour" label="Colour" error={errors.colourId}>
          <OptionSelect id="variant-colour" value={form.colourId} noneLabel="No colour" options={colours.map((colour) => ({ value: colour.id, label: colour.name }))} onChange={(colourId) => update({ colourId })} />
        </FormField>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <FormField id="variant-mrp" label="MRP" help="Optional." error={errors.mrp}>
          <MoneyInput id="variant-mrp" value={form.mrp} aria-invalid={Boolean(errors.mrp)} onValueChange={(mrp) => update({ mrp })} />
        </FormField>
        <FormField id="variant-price" label="Price" error={errors.price}>
          <MoneyInput id="variant-price" value={form.price} aria-invalid={Boolean(errors.price)} onValueChange={(price) => update({ price })} />
        </FormField>
      </div>
      <ActiveSwitchField id="variant-active" label="Active" help="Inactive variants are hidden in the shop." checked={form.isActive} onCheckedChange={(isActive) => update({ isActive })} />
    </FormDialog>
  );
}

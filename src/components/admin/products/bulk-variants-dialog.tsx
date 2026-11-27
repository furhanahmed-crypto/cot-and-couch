"use client";

import { useState } from "react";
import { bulkCreateVariantsAction } from "@/app/admin/products/variant-actions";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { MoneyInput } from "@/components/admin/common/money-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { ListEditor } from "./list-editor";
import type { VariantEditorContext } from "./variants-tab";

type SizeRow = { sizeLabel: string; lengthIn: string; widthIn: string };
const EMPTY_FORM = { sizes: [{ sizeLabel: "", lengthIn: "", widthIn: "" }] as SizeRow[], qualityIds: [] as string[], colourIds: [] as string[], thicknesses: "", mrp: "", price: "" };

function toggle(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

/** Creates every size x quality x thickness x colour that does not exist yet, with one price. */
export function BulkVariantsDialog({ open, onOpenChange, context }: { open: boolean; onOpenChange: (open: boolean) => void; context: VariantEditorContext }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const thicknessIns = form.thicknesses.split(",").map((value) => value.trim()).filter(Boolean);
  const comboCount = form.sizes.length * Math.max(1, form.qualityIds.length) * Math.max(1, form.colourIds.length) * Math.max(1, thicknessIns.length);
  const qualities = context.qualities.filter((quality) => quality.isActive);
  const colours = context.colours.filter((colour) => colour.isActive);

  function save() {
    const input = { productId: context.productId, sizes: form.sizes, qualityIds: form.qualityIds, colourIds: form.colourIds, thicknessIns, mrp: form.mrp, price: form.price };
    run(
      () => bulkCreateVariantsAction(input),
      { loading: "Adding variants…", success: "Variants added. Check each price.", error: "Could not add the variants" },
      () => {
        onOpenChange(false);
        setForm(EMPTY_FORM);
      },
      setErrors,
    );
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add many variants" description={`${comboCount} combinations. Ones that already exist are skipped.`} submitLabel="Add variants" isPending={isPending} onSubmit={save}>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Sizes</legend>
        <ListEditor
          items={form.sizes}
          onChange={(sizes) => setForm({ ...form, sizes })}
          newItem={() => ({ sizeLabel: "", lengthIn: "", widthIn: "" })}
          addLabel="Add size"
          renderItem={(size, update, position) => (
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-2">
              <Input aria-label={`Size ${position + 1}`} placeholder="Size, e.g. King" value={size.sizeLabel} onChange={(event) => update({ ...size, sizeLabel: event.target.value })} />
              {context.fields.dimensions ? <Input aria-label="Length in inches" placeholder="L in" type="number" value={size.lengthIn} onChange={(event) => update({ ...size, lengthIn: event.target.value })} /> : <span />}
              {context.fields.dimensions ? <Input aria-label="Width in inches" placeholder="W in" type="number" value={size.widthIn} onChange={(event) => update({ ...size, widthIn: event.target.value })} /> : <span />}
            </div>
          )}
        />
        {errors.sizes ? <p className="text-xs text-destructive">{errors.sizes}</p> : null}
      </fieldset>
      {[
        { title: "Qualities", items: qualities, field: "qualityIds" as const },
        { title: "Colours", items: context.fields.colour ? colours : [], field: "colourIds" as const },
      ].map((group) =>
        group.items.length ? (
          <fieldset key={group.field} className="space-y-2">
            <legend className="mb-2 text-sm font-medium">{group.title}</legend>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <Label key={item.id} className="flex cursor-pointer items-center gap-2 font-normal">
                  <Checkbox checked={form[group.field].includes(item.id)} onCheckedChange={() => setForm({ ...form, [group.field]: toggle(form[group.field], item.id) })} />
                  {item.name}
                </Label>
              ))}
            </div>
          </fieldset>
        ) : null,
      )}
      {context.fields.thickness ? (
        <FormField id="bulk-thickness" label="Thicknesses (in)" help="Separate with commas, e.g. 6, 8">
          <Input id="bulk-thickness" value={form.thicknesses} onChange={(event) => setForm({ ...form, thicknesses: event.target.value })} />
        </FormField>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <FormField id="bulk-mrp" label="MRP for all" help="Optional." error={errors.mrp}>
          <MoneyInput id="bulk-mrp" value={form.mrp} onValueChange={(mrp) => setForm({ ...form, mrp })} />
        </FormField>
        <FormField id="bulk-price" label="Price for all" help="Edit each one after." error={errors.price}>
          <MoneyInput id="bulk-price" value={form.price} onValueChange={(price) => setForm({ ...form, price })} />
        </FormField>
      </div>
    </FormDialog>
  );
}

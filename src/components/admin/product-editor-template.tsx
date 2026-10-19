"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  templateFieldKey,
  type CategoryProductTemplate,
} from "@/constants/admin-product-templates";
import type { ProductEditorLookups } from "@/types";

const selectClass =
  "h-9 w-full max-w-full rounded-lg border border-input bg-background px-2 text-sm";

export type MattressSpecState = {
  mattressBrandId: string;
  purposeOptionId: string;
  comfortOptionId: string;
  fillingOptionId: string;
  coverMaterialOptionId: string;
  warrantyYears: string;
  removableCover: string;
  flippable: string;
  trialNights: string;
  idealFor: string;
};

type Props = {
  template: CategoryProductTemplate | undefined;
  categorySlug: string;
  lookups: ProductEditorLookups;
  mattress: MattressSpecState;
  onMattressChange: (patch: Partial<MattressSpecState>) => void;
  attributes: Record<string, string>;
  onAttributeChange: (key: string, value: string) => void;
};

export function ProductEditorTemplate({
  template,
  categorySlug,
  lookups,
  mattress,
  onMattressChange,
  attributes,
  onAttributeChange,
}: Props) {
  if (!template) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        No category template mapped yet for this product.
      </section>
    );
  }

  const isMattress = categorySlug === "mattresses";

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-heading text-lg break-words">
            Category template: {template.name}
          </h2>
          <p className="text-sm text-muted-foreground break-words">
            Variant axes: {template.variants.join(" · ")}
          </p>
          {template.note ? (
            <p className="mt-1 text-xs text-muted-foreground break-words">
              {template.note}
            </p>
          ) : null}
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
        >
          Neon-backed
        </Badge>
      </div>

      {isMattress ? (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <FieldSelect
            label="Brand"
            required
            value={mattress.mattressBrandId}
            onChange={(v) => onMattressChange({ mattressBrandId: v })}
            options={lookups.brands.map((b) => ({ id: b.id, label: b.name }))}
          />
          <FieldSelect
            label="Mattress type"
            required
            value={mattress.purposeOptionId}
            onChange={(v) => onMattressChange({ purposeOptionId: v })}
            options={lookups.purpose}
          />
          <FieldSelect
            label="Firmness"
            required
            value={mattress.comfortOptionId}
            onChange={(v) => onMattressChange({ comfortOptionId: v })}
            options={lookups.comfort}
          />
          <FieldSelect
            label="Layer construction"
            required
            value={mattress.fillingOptionId}
            onChange={(v) => onMattressChange({ fillingOptionId: v })}
            options={lookups.filling}
          />
          <FieldSelect
            label="Cover fabric"
            required
            value={mattress.coverMaterialOptionId}
            onChange={(v) => onMattressChange({ coverMaterialOptionId: v })}
            options={lookups.coverMaterial}
          />
          <div className="min-w-0 space-y-1">
            <Label>
              Brand warranty (years) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              max={25}
              value={mattress.warrantyYears}
              onChange={(e) =>
                onMattressChange({ warrantyYears: e.target.value })
              }
              className="max-w-full"
            />
          </div>
          <FieldSelect
            label="Removable cover"
            value={mattress.removableCover}
            onChange={(v) => onMattressChange({ removableCover: v })}
            options={[
              { id: "yes", label: "Yes" },
              { id: "no", label: "No" },
            ]}
            allowEmpty
          />
          <FieldSelect
            label="Flippable"
            value={mattress.flippable}
            onChange={(v) => onMattressChange({ flippable: v })}
            options={[
              { id: "yes", label: "Yes" },
              { id: "no", label: "No" },
            ]}
            allowEmpty
          />
          <div className="min-w-0 space-y-1">
            <Label>Trial period (nights)</Label>
            <Input
              type="number"
              min={0}
              value={mattress.trialNights}
              onChange={(e) =>
                onMattressChange({ trialNights: e.target.value })
              }
              className="max-w-full"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <Label>Ideal for</Label>
            <Input
              value={mattress.idealFor}
              onChange={(e) => onMattressChange({ idealFor: e.target.value })}
              placeholder="e.g. Side sleepers, couples"
              className="max-w-full"
            />
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {[...template.required, ...template.optional].map((name) => {
            const key = templateFieldKey(name);
            const required = template.required.includes(name);
            return (
              <div key={key} className="min-w-0 space-y-1">
                <Label className="break-words">
                  {name}
                  {required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>
                <Input
                  value={attributes[key] ?? ""}
                  onChange={(e) => onAttributeChange(key, e.target.value)}
                  placeholder={required ? "Required" : "Optional"}
                  className="max-w-full"
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  required,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  required?: boolean;
  allowEmpty?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {(allowEmpty || !required) && (
          <option value="">Select…</option>
        )}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

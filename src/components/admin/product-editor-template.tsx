"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppSelect } from "@/components/ui/app-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryConfigForSlug } from "@/constants/category-config";
import { BED_VARIANT_ONLY_GROUP_KEYS } from "@/constants/bed-model";
import type { CategoryProductTemplate } from "@/constants/admin-product-templates";
import { ROUTES } from "@/constants/routes";
import type { ProductEditorLookups } from "@/types";

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
  const isMattress = categorySlug === "mattresses";
  const furniture = categoryConfigForSlug(categorySlug);
  const requiredLabels = useMemo(
    () => new Set(template?.required ?? []),
    [template?.required],
  );

  const brandFilter = useMemo(() => {
    const ids = lookups.brandOptionIds[mattress.mattressBrandId];
    if (!ids?.length) return null;
    return new Set(ids);
  }, [lookups.brandOptionIds, mattress.mattressBrandId]);

  const filterOpts = <T extends { id: string }>(list: T[]) =>
    brandFilter ? list.filter((o) => brandFilter.has(o.id)) : list;

  const furnitureGroups = useMemo(() => {
    if (!furniture) return [];
    return furniture.groups
      .filter((g) => !BED_VARIANT_ONLY_GROUP_KEYS.has(g.key))
      .map((g) => ({
        ...g,
        options: (lookups.furnitureOptionsByKey[g.key] ?? []).filter(
          (o) => o.label.trim().length > 0,
        ),
      }))
      .filter((g) => g.options.length > 0);
  }, [furniture, lookups.furnitureOptionsByKey]);

  if (!template) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        No category template mapped yet for this product.
      </section>
    );
  }

  const title = furniture?.title ?? template.name;
  const variants = furniture?.variants ?? template.variants;
  const note = furniture?.note ?? template.note;

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <h2 className="font-heading text-lg break-words">Specifications</h2>
        <p className="text-sm text-muted-foreground break-words">
          {title} · Variant axes: {variants.join(" · ")}
        </p>
        {note ? (
          <p className="mt-1 text-xs text-muted-foreground break-words">{note}</p>
        ) : null}
      </div>

      {isMattress ? (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <FieldSelect
            label="Brand"
            required
            value={mattress.mattressBrandId}
            onChange={(v) =>
              onMattressChange({
                mattressBrandId: v,
                purposeOptionId: "",
                comfortOptionId: "",
                fillingOptionId: "",
                coverMaterialOptionId: "",
              })
            }
            options={lookups.brands.map((b) => ({ id: b.id, label: b.name }))}
          />
          {!mattress.mattressBrandId ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Choose a brand to see its mattress types, firmness, layers, and
              cover options.
            </p>
          ) : null}
          {filterOpts(lookups.purpose).length > 0 ? (
            <FieldSelect
              label="Mattress type"
              required
              value={mattress.purposeOptionId}
              onChange={(v) => onMattressChange({ purposeOptionId: v })}
              options={filterOpts(lookups.purpose)}
              disabled={!mattress.mattressBrandId}
            />
          ) : null}
          {filterOpts(lookups.comfort).length > 0 ? (
            <FieldSelect
              label="Firmness"
              required
              value={mattress.comfortOptionId}
              onChange={(v) => onMattressChange({ comfortOptionId: v })}
              options={filterOpts(lookups.comfort)}
              disabled={!mattress.mattressBrandId}
            />
          ) : null}
          {filterOpts(lookups.filling).length > 0 ? (
            <FieldSelect
              label="Layer construction"
              required
              value={mattress.fillingOptionId}
              onChange={(v) => onMattressChange({ fillingOptionId: v })}
              options={filterOpts(lookups.filling)}
              disabled={!mattress.mattressBrandId}
            />
          ) : null}
          {filterOpts(lookups.coverMaterial).length > 0 ? (
            <FieldSelect
              label="Cover fabric"
              required
              value={mattress.coverMaterialOptionId}
              onChange={(v) => onMattressChange({ coverMaterialOptionId: v })}
              options={filterOpts(lookups.coverMaterial)}
              disabled={!mattress.mattressBrandId}
            />
          ) : null}
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
      ) : furnitureGroups.length ? (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {furnitureGroups.map((g) => (
            <FieldSelect
              key={g.key}
              label={g.label}
              required={requiredLabels.has(g.label)}
              value={attributes[g.key] ?? ""}
              onChange={(v) => onAttributeChange(g.key, v)}
              options={g.options.map((o) => ({
                id: o.label,
                label: o.label,
              }))}
              allowEmpty={!requiredLabels.has(g.label)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No configuration options are set up for this category yet. Add them
          under{" "}
          <Link
            href={ROUTES.admin.categories}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Categories &amp; templates
          </Link>
          .
        </p>
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
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  required?: boolean;
  allowEmpty?: boolean;
  disabled?: boolean;
}) {
  const items = [
    ...(allowEmpty || !required
      ? [{ value: "__none__", label: "Select…" }]
      : []),
    ...options.map((o) => ({ value: o.id, label: o.label })),
  ];
  return (
    <div className="min-w-0 space-y-1">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <AppSelect
        value={value || "__none__"}
        onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
        items={items}
        placeholder="Select…"
        triggerClassName="w-full"
        disabled={disabled}
      />
    </div>
  );
}

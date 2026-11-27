"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { EMPTY_FILTERS, type ProductFilters } from "@/lib/product-filters";

export type FilterOption = { value: string; label: string; hex?: string };
export type FilterOptions = {
  qualities: FilterOption[];
  brands: FilterOption[];
  sizes: FilterOption[];
  colours: FilterOption[];
  collections: FilterOption[];
  /** Spec label -> values, e.g. Comfort -> Firm, Soft. */
  specs: { label: string; values: string[] }[];
};

type ListField = "qualityIds" | "brandIds" | "sizeLabels" | "colourIds" | "collectionIds";

const PRICE_LIMITS = [15000, 20000, 30000, 40000, 50000];
const DISCOUNT_STEPS = [10, 20, 30];

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function CheckboxGroup(props: { title: string; options: FilterOption[]; selected: string[]; onToggle: (value: string) => void }) {
  if (props.options.length < 2) return null;
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-medium">{props.title}</legend>
      {props.options.map((option) => (
        <Label key={option.value} className="flex cursor-pointer items-center gap-2 font-normal">
          <Checkbox checked={props.selected.includes(option.value)} onCheckedChange={() => props.onToggle(option.value)} />
          {option.hex ? <span className="size-3 rounded-full ring-1 ring-border" style={{ background: option.hex }} /> : null}
          {option.label}
        </Label>
      ))}
    </fieldset>
  );
}

function ChoiceGroup(props: { title: string; options: { value: number; label: string }[]; selected: number | null; onSelect: (value: number | null) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-medium">{props.title}</legend>
      {props.options.map((option) => (
        <Label key={option.value} className="flex cursor-pointer items-center gap-2 font-normal">
          <Checkbox
            checked={props.selected === option.value}
            onCheckedChange={(checked) => props.onSelect(checked ? option.value : null)}
          />
          {option.label}
        </Label>
      ))}
    </fieldset>
  );
}

type FilterPanelProps = { filters: ProductFilters; options: FilterOptions; onChange: (next: ProductFilters) => void };

export function FilterPanel({ filters, options, onChange }: FilterPanelProps) {
  function toggleList(field: ListField, value: string) {
    onChange({ ...filters, [field]: toggleValue(filters[field], value) });
  }
  function toggleSpec(label: string, value: string) {
    onChange({ ...filters, specs: { ...filters.specs, [label]: toggleValue(filters.specs[label] ?? [], value) } });
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}>
          Clear all
        </Button>
      </div>
      <CheckboxGroup title="Quality" options={options.qualities} selected={filters.qualityIds} onToggle={(value) => toggleList("qualityIds", value)} />
      <CheckboxGroup title="Brand" options={options.brands} selected={filters.brandIds} onToggle={(value) => toggleList("brandIds", value)} />
      <CheckboxGroup title="Size" options={options.sizes} selected={filters.sizeLabels} onToggle={(value) => toggleList("sizeLabels", value)} />
      {options.specs.map((spec) => (
        <CheckboxGroup
          key={spec.label}
          title={spec.label}
          options={spec.values.map((value) => ({ value, label: value }))}
          selected={filters.specs[spec.label] ?? []}
          onToggle={(value) => toggleSpec(spec.label, value)}
        />
      ))}
      <CheckboxGroup title="Colour / finish" options={options.colours} selected={filters.colourIds} onToggle={(value) => toggleList("colourIds", value)} />
      <ChoiceGroup
        title="Price"
        options={PRICE_LIMITS.map((limit) => ({ value: limit, label: `Under ${formatPrice(limit)}` }))}
        selected={filters.priceMax}
        onSelect={(priceMax) => onChange({ ...filters, priceMax })}
      />
      <ChoiceGroup
        title="Discount"
        options={DISCOUNT_STEPS.map((step) => ({ value: step, label: `${step}% or more` }))}
        selected={filters.discountMin}
        onSelect={(discountMin) => onChange({ ...filters, discountMin })}
      />
      <CheckboxGroup title="Collection" options={options.collections} selected={filters.collectionIds} onToggle={(value) => toggleList("collectionIds", value)} />
    </div>
  );
}

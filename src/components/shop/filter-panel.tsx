"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FilterState } from "@/lib/catalogue-utils";
import type {
  AttributeField,
  Collection,
  Colour,
  StockStatus,
} from "@/types";

const AVAIL: { id: StockStatus; label: string }[] = [
  { id: "in_stock", label: "In stock" },
  { id: "made_to_order", label: "Made to order" },
  { id: "low_stock", label: "Low stock" },
];

/** Keys already rendered as common filters — never repeat from attribute templates. */
const COMMON_FILTER_KEYS = new Set([
  "colour",
  "color",
  "colour_finish",
  "finish",
  "collection",
  "collections",
  "availability",
  "price",
  "discount",
]);

export function FilterPanel({
  filters,
  onChange,
  colours,
  collections,
  extraFields = [],
  onClear,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  colours: Colour[];
  collections: Collection[];
  extraFields?: AttributeField[];
  onClear: () => void;
}) {
  const price = [filters.priceMin ?? 0, filters.priceMax ?? 100000];
  const categoryFields = extraFields.filter(
    (f) =>
      f.filterable &&
      f.options &&
      !COMMON_FILTER_KEYS.has(f.key.toLowerCase()) &&
      !/colour|color|finish/i.test(f.label),
  );

  function toggleArr(key: keyof FilterState, value: string) {
    const current = (filters[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear all
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Price range</Label>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={price}
          onValueChange={(next) => {
            const vals = Array.isArray(next) ? next : [next];
            onChange({
              ...filters,
              priceMin: Number(vals[0] ?? 0),
              priceMax: Number(vals[1] ?? 100000),
            });
          }}
        />
        <p className="text-xs text-muted-foreground">
          ₹{price[0].toLocaleString("en-IN")} – ₹{price[1].toLocaleString("en-IN")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Discount</Label>
        {[10, 20, 30].map((d) => (
          <label key={d} className="flex items-center gap-2">
            <Checkbox
              checked={(filters.discountMin ?? 0) === d}
              onCheckedChange={(v) =>
                onChange({ ...filters, discountMin: v ? d : undefined })
              }
            />
            {d}%+
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Colour / finish</Label>
        {colours.map((c) => (
          <label key={c.id} className="flex items-center gap-2">
            <Checkbox
              checked={filters.colours?.includes(c.id)}
              onCheckedChange={() => toggleArr("colours", c.id)}
            />
            <span
              className="size-3 rounded-full ring-1 ring-border"
              style={{ background: c.hex }}
            />
            {c.name}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Collection</Label>
        {collections.map((c) => (
          <label key={c.id} className="flex items-center gap-2">
            <Checkbox
              checked={filters.collections?.includes(c.id)}
              onCheckedChange={() => toggleArr("collections", c.id)}
            />
            {c.name}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        {AVAIL.map((a) => (
          <label key={a.id} className="flex items-center gap-2">
            <Checkbox
              checked={filters.availability?.includes(a.id)}
              onCheckedChange={() => toggleArr("availability", a.id)}
            />
            {a.label}
          </label>
        ))}
      </div>

      {categoryFields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}</Label>
          {f.options!.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <Checkbox
                checked={filters.extra?.[f.key]?.includes(opt)}
                onCheckedChange={() => {
                  const cur = filters.extra?.[f.key] ?? [];
                  const next = cur.includes(opt)
                    ? cur.filter((x) => x !== opt)
                    : [...cur, opt];
                  onChange({
                    ...filters,
                    extra: { ...filters.extra, [f.key]: next },
                  });
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

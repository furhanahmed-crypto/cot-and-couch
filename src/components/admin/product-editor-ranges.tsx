"use client";

import { Checkbox } from "@/components/ui/checkbox";

type RangeOption = { id: string; name: string; slug: string };

/** Multiselect which bed ranges include this product. */
export function ProductEditorRanges({
  ranges,
  selectedIds,
  onChange,
}: {
  ranges: RangeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-heading text-lg">Available ranges</h2>
        <p className="text-sm text-muted-foreground">
          Select every range this style sells in. Shop lists it under each, and
          Change quality uses these options.
        </p>
      </div>

      {!ranges.length ? (
        <p className="text-sm text-muted-foreground">
          No bed ranges yet. Add them under Categories → Cots.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {ranges.map((r) => {
            const checked = selectedIds.includes(r.id);
            return (
              <li key={r.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm hover:border-foreground/30">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(r.id)}
                  />
                  <span>{r.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} selected
        {selectedIds.length === 0 ? " · pick at least one range" : ""}
      </p>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/constants/routes";

type ColourOption = { id: string; label: string; slug: string };

export function ProductEditorColors({
  colours,
  selectedIds,
  onChange,
}: {
  colours: ColourOption[];
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
        <h2 className="font-heading text-lg">Available colors</h2>
        <p className="text-sm text-muted-foreground">
          Choose which master colours this product sells. Save, then generate
          or update variants.
        </p>
      </div>

      {!colours.length ? (
        <p className="text-sm text-muted-foreground">
          No colour masters yet. Add them under{" "}
          <Link
            href={ROUTES.admin.brands}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Mattress brands
          </Link>{" "}
          (shared colour list).
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {colours.map((c) => {
            const checked = selectedIds.includes(c.id);
            return (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm hover:border-foreground/30">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(c.id)}
                  />
                  <span>{c.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} selected
        {selectedIds.length === 0
          ? " · pick at least one before generating variants"
          : ""}
      </p>
    </section>
  );
}

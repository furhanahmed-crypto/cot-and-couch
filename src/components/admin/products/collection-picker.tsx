"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { OptionItem } from "@/types/admin-products";

type CollectionPickerProps = { collections: OptionItem[]; selectedIds: string[]; onChange: (ids: string[]) => void };

export function CollectionPicker({ collections, selectedIds, onChange }: CollectionPickerProps) {
  if (!collections.length) return null;

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Collections</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {collections.map((collection) => (
          <Label key={collection.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 font-normal">
            <Checkbox checked={selectedIds.includes(collection.id)} onCheckedChange={() => toggle(collection.id)} />
            {collection.name}
          </Label>
        ))}
      </div>
    </fieldset>
  );
}

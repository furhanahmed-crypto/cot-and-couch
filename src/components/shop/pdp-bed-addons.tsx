"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import type { ShopBedAddon } from "@/constants/bed-pricing";

export function PdpBedAddons({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: ShopBedAddon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (!addons.length) return null;

  return (
    <div className="space-y-2">
      <Label>Additional storage & cushion</Label>
      <ul className="space-y-2">
        {addons.map((addon) => {
          const checked = selectedIds.includes(addon.id);
          return (
            <li key={addon.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/70 px-3 py-2 text-sm hover:border-foreground/30">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(addon.id)}
                  className="mt-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{addon.label}</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    +{formatINR(addon.price)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

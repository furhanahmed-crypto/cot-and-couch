"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { getAddonUnitPrice } from "@/lib/pricing";
import type { AddonKind } from "@/constants/products";
import type { AddonOption, VariantOption } from "@/types/catalogue";

type PdpAddonsProps = {
  /** Add-ons offered for the selected variant. */
  addons: AddonOption[];
  variant: VariantOption;
  selectedIds: string[];
  onToggle: (addonId: string) => void;
};

const GROUP_TITLES: Record<AddonKind, string> = {
  recliner: "Recliners",
  addon: "Additional options",
};

export function PdpAddons({ addons, variant, selectedIds, onToggle }: PdpAddonsProps) {
  if (!addons.length) return null;
  const groups = (Object.keys(GROUP_TITLES) as AddonKind[])
    .map((kind) => ({ kind, items: addons.filter((addon) => addon.kind === kind) }))
    .filter((group) => group.items.length);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <fieldset key={group.kind} className="space-y-2">
          <legend className="mb-2 text-sm font-medium">{GROUP_TITLES[group.kind]}</legend>
          {group.items.map((addon) => {
            const price = getAddonUnitPrice(addon, variant) ?? 0;
            const perSeat = addon.priceUnit === "per_seat" && variant.seats;
            return (
              <Label
                key={addon.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 font-normal"
              >
                <span className="flex items-center gap-2">
                  <Checkbox checked={selectedIds.includes(addon.id)} onCheckedChange={() => onToggle(addon.id)} />
                  {addon.name}
                </span>
                <span className="text-right text-sm">
                  + {formatPrice(price)}
                  {perSeat ? (
                    <span className="block text-xs text-muted-foreground">
                      {formatPrice(price / variant.seats!)} x {variant.seats} seats
                    </span>
                  ) : null}
                </span>
              </Label>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

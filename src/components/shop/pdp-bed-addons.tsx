"use client";

import { Label } from "@/components/ui/label";
import type { ShopBedAddon } from "@/constants/bed-pricing";
import { PdpAddonRow } from "@/components/shop/pdp-addon-row";
import { PdpStorageAddon } from "@/components/shop/pdp-storage-addon";

const STORAGE_KEYS = new Set(["storage_king", "storage_queen"]);

export function PdpBedAddons({
  addons,
  selectedIds,
  onChange,
}: {
  addons: ShopBedAddon[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  if (!addons.length) return null;

  const storage = addons.find((a) => STORAGE_KEYS.has(a.key));
  const hydraulics = addons.find((a) => a.key === "hydraulics");
  const others = addons.filter(
    (a) => !STORAGE_KEYS.has(a.key) && a.key !== "hydraulics",
  );

  function toggleOther(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <div className="space-y-3">
      <Label>Additional storage & cushion</Label>

      {storage ? (
        <PdpStorageAddon
          storage={storage}
          hydraulics={hydraulics}
          selectedIds={selectedIds}
          onChange={onChange}
        />
      ) : null}

      <ul className="space-y-2">
        {others.map((addon) => (
          <li key={addon.id}>
            <PdpAddonRow
              label={addon.label}
              price={addon.price}
              checked={selectedIds.includes(addon.id)}
              onToggle={() => toggleOther(addon.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { formatINR } from "@/lib/format";
import type { ShopBedAddon } from "@/constants/bed-pricing";

type StorageMode = "none" | "manual" | "hydraulics";

export function PdpStorageAddon({
  storage,
  hydraulics,
  selectedIds,
  onChange,
}: {
  storage: ShopBedAddon;
  hydraulics: ShopBedAddon | undefined;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const storageOn = selectedIds.includes(storage.id);
  const hydraulicsOn = Boolean(
    hydraulics && selectedIds.includes(hydraulics.id),
  );
  const mode: StorageMode = !storageOn
    ? "none"
    : hydraulicsOn
      ? "hydraulics"
      : "manual";

  function baseIds() {
    const drop = new Set(
      [storage.id, hydraulics?.id].filter(Boolean) as string[],
    );
    return selectedIds.filter((id) => !drop.has(id));
  }

  function setMode(next: StorageMode) {
    const base = baseIds();
    if (next === "none") {
      onChange(base);
      return;
    }
    if (next === "hydraulics" && hydraulics) {
      onChange([...base, storage.id, hydraulics.id]);
      return;
    }
    onChange([...base, storage.id]);
  }

  return (
    <div className="space-y-2 rounded-md border border-border/70 p-3">
      <p className="text-sm font-medium">Storage type</p>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="storage-mode"
            checked={mode === "none"}
            onChange={() => setMode("none")}
            className="accent-foreground"
          />
          <span>None</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="storage-mode"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
            className="accent-foreground"
          />
          <span>
            Manual
            <span className="ml-1 text-muted-foreground">
              +{formatINR(storage.price)}
            </span>
          </span>
        </label>
        {hydraulics ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="storage-mode"
              checked={mode === "hydraulics"}
              onChange={() => setMode("hydraulics")}
              className="accent-foreground"
            />
            <span>
              Hydraulic
              <span className="ml-1 text-muted-foreground">
                +{formatINR(storage.price + hydraulics.price)}
              </span>
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { saveAddonPricesAction } from "@/app/admin/categories/addon-actions";
import { MoneyInput } from "@/components/admin/common/money-input";
import { SaveBar } from "@/components/admin/common/save-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AddonAdminRow, QualityAdminRow } from "@/types/admin-catalogue";

type Grid = Record<string, Record<string, string>>;

function toGrid(addons: AddonAdminRow[]): Grid {
  return Object.fromEntries(
    addons.map((addon) => [addon.id, Object.fromEntries(Object.entries(addon.prices).map(([qualityId, price]) => [qualityId, String(price)]))]),
  );
}

type AddonPriceGridProps = { addons: AddonAdminRow[]; qualities: QualityAdminRow[] };

/** Rows = add-ons, columns = qualities. An empty cell means "not offered for that quality". */
export function AddonPriceGrid({ addons, qualities }: AddonPriceGridProps) {
  const [saved, setSaved] = useState(() => toGrid(addons));
  const [grid, setGrid] = useState(saved);
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(grid) !== JSON.stringify(saved);

  // New or removed add-ons from the server reset the grid.
  const addonKey = addons.map((addon) => addon.id).join(",");
  const [seenKey, setSeenKey] = useState(addonKey);
  if (addonKey !== seenKey) {
    setSeenKey(addonKey);
    setSaved(toGrid(addons));
    setGrid(toGrid(addons));
  }

  function setCell(addonId: string, qualityId: string, value: string) {
    setGrid({ ...grid, [addonId]: { ...grid[addonId], [qualityId]: value } });
  }

  function save() {
    const cells = Object.entries(grid).flatMap(([addonId, row]) =>
      Object.entries(row).filter(([, price]) => price !== "").map(([qualityId, price]) => ({ addonId, qualityId, price })),
    );
    run(
      () => saveAddonPricesAction({ addonIds: addons.map((addon) => addon.id), cells }),
      { loading: "Saving prices…", success: "Prices saved", error: "Could not save the prices" },
      () => setSaved(grid),
    );
  }

  if (!addons.length || !qualities.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">Prices</h3>
        <p className="text-sm text-muted-foreground">Leave a cell empty when that quality does not offer the add-on.</p>
      </div>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Add-on</TableHead>
              {qualities.map((quality) => (
                <TableHead key={quality.id} className="min-w-32 text-right">{quality.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.map((addon) => (
              <TableRow key={addon.id}>
                <TableCell className="sticky left-0 bg-card font-medium">
                  {addon.name}
                  {addon.sizeLabel ? <span className="block text-xs font-normal text-muted-foreground">{addon.sizeLabel} only</span> : null}
                  {addon.priceUnit === "per_seat" ? <span className="block text-xs font-normal text-muted-foreground">Per seat</span> : null}
                </TableCell>
                {qualities.map((quality) => (
                  <TableCell key={quality.id}>
                    <MoneyInput
                      aria-label={`${addon.name}, ${quality.name}`}
                      placeholder="—"
                      value={grid[addon.id]?.[quality.id] ?? ""}
                      onValueChange={(value) => setCell(addon.id, quality.id, value)}
                      className="h-8 text-right"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setGrid(saved)} saveLabel="Save prices" />
    </section>
  );
}

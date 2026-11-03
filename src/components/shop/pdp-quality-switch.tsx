"use client";

import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/ui/app-select";
import { bedRangeShortName } from "@/constants/bed-model";

export type PdpQualityOption = {
  id: string;
  name: string;
  slug: string;
};

/** In-page Ideal / Optimum / Essential (or any linked ranges). */
export function PdpQualitySwitch({
  value,
  options,
  onChange,
}: {
  value: string;
  options: PdpQualityOption[];
  onChange: (rangeId: string) => void;
}) {
  if (options.length < 2) return null;

  const items = options.map((o) => ({
    value: o.id,
    label: bedRangeShortName(o.name),
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor="pdp-change-quality">Change quality</Label>
      <AppSelect
        id="pdp-change-quality"
        value={value}
        items={items}
        placeholder="Select quality"
        triggerClassName="w-full sm:w-56"
        onValueChange={onChange}
      />
    </div>
  );
}

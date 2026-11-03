"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/ui/app-select";
import { ROUTES } from "@/constants/routes";

export type PdpQualityOption = {
  rangeSlug: string;
  label: string;
  productSlug: string;
};

/** Switch Ideal ↔ Optimum ↔ Essential for the same bed style. */
export function PdpQualitySwitch({
  currentRangeSlug,
  options,
}: {
  currentRangeSlug: string;
  options: PdpQualityOption[];
}) {
  const router = useRouter();
  if (options.length < 2) return null;

  const items = options.map((o) => ({
    value: o.productSlug,
    label: o.label,
  }));
  const current =
    options.find((o) => o.rangeSlug === currentRangeSlug)?.productSlug ??
    items[0]!.value;

  return (
    <div className="space-y-2">
      <Label htmlFor="pdp-change-quality">Change quality</Label>
      <AppSelect
        id="pdp-change-quality"
        value={current}
        items={items}
        placeholder="Select quality"
        triggerClassName="w-full sm:w-56"
        onValueChange={(slug) => {
          if (slug === current) return;
          router.push(ROUTES.product(slug));
        }}
      />
    </div>
  );
}

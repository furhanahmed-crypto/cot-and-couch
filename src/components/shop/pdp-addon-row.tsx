"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatINR } from "@/lib/format";

export function PdpAddonRow({
  label,
  price,
  checked,
  onToggle,
}: {
  label: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/70 px-3 py-2 text-sm hover:border-foreground/30">
      <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-0.5" />
      <span className="min-w-0 flex-1">
        <span className="font-medium">{label}</span>
        <span className="mt-0.5 block text-muted-foreground">
          +{formatINR(price)}
        </span>
      </span>
    </label>
  );
}

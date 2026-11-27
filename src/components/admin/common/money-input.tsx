"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  /** Whole rupees as typed, e.g. "18800". "" when empty. */
  value: string;
  onValueChange: (value: string) => void;
};

/** "₹" prefix, digits only (no decimals: all client prices are whole rupees). */
export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onValueChange(event.target.value.replace(/\D/g, ""))}
        className={cn("pl-7 tabular-nums", className)}
      />
    </div>
  );
}

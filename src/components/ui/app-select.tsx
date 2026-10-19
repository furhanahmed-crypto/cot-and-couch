"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AppSelectItem = { value: string; label: string };

/** Consistent shadcn Select wrapper — use instead of native `<select>`. */
export function AppSelect({
  value,
  onValueChange,
  items,
  placeholder = "Select…",
  disabled,
  className,
  triggerClassName,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: AppSelectItem[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
}) {
  return (
    <Select
      items={items}
      value={value || undefined}
      onValueChange={(v) => {
        if (typeof v === "string") onValueChange(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn("min-w-0", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

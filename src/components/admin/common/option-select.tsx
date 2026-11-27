"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE_VALUE = "__none__";

type OptionSelectProps = {
  id: string;
  /** "" = nothing chosen. */
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Label for the "nothing" choice, e.g. "No brand". Omit to force a choice. */
  noneLabel?: string;
  placeholder?: string;
  isInvalid?: boolean;
  disabled?: boolean;
};

/** A form select. "" in and out means no value. */
export function OptionSelect({ id, value, onChange, options, noneLabel, placeholder = "Choose…", isInvalid, disabled }: OptionSelectProps) {
  const items = noneLabel ? [{ value: NONE_VALUE, label: noneLabel }, ...options] : options;
  const selected = value || (noneLabel ? NONE_VALUE : null);

  return (
    <Select
      items={items}
      value={selected}
      disabled={disabled}
      onValueChange={(next) => onChange(next === NONE_VALUE || next === null ? "" : String(next))}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={isInvalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

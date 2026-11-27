"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ActiveSwitchFieldProps = {
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** A labelled on/off switch, e.g. "Active" or "Featured". */
export function ActiveSwitchField({ id, label, help, checked, onCheckedChange }: ActiveSwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

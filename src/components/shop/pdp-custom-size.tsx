"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CUSTOM_SIZE_MAX_IN, CUSTOM_SIZE_MIN_IN } from "@/validation/shop";

export type CustomSize = { isOn: boolean; lengthIn: string; widthIn: string };
export const NO_CUSTOM_SIZE: CustomSize = { isOn: false, lengthIn: "", widthIn: "" };

type PdpCustomSizeProps = { value: CustomSize; onChange: (next: CustomSize) => void };

/** Optional custom length and width in whole inches. The server checks the range. */
export function PdpCustomSize({ value, onChange }: PdpCustomSizeProps) {
  return (
    <div className="space-y-3">
      <Label className="flex cursor-pointer items-center gap-2 font-normal">
        <Checkbox checked={value.isOn} onCheckedChange={(checked) => onChange({ ...value, isOn: Boolean(checked) })} />
        I need a custom size
      </Label>
      {value.isOn ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-length">Length (in)</Label>
              <Input
                id="custom-length"
                type="number"
                inputMode="numeric"
                min={CUSTOM_SIZE_MIN_IN}
                max={CUSTOM_SIZE_MAX_IN}
                step={1}
                value={value.lengthIn}
                onChange={(event) => onChange({ ...value, lengthIn: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-width">Width (in)</Label>
              <Input
                id="custom-width"
                type="number"
                inputMode="numeric"
                min={CUSTOM_SIZE_MIN_IN}
                max={CUSTOM_SIZE_MAX_IN}
                step={1}
                value={value.widthIn}
                onChange={(event) => onChange({ ...value, widthIn: event.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Whole inches, {CUSTOM_SIZE_MIN_IN}–{CUSTOM_SIZE_MAX_IN}. The showroom will confirm custom sizes with you.
          </p>
        </div>
      ) : null}
    </div>
  );
}

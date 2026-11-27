"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  isChoiceAvailable,
  listAxisValues,
  toChoice,
  type VariantAxis,
} from "@/lib/variant-picker";
import type { ColourItem, QualityItem, VariantOption } from "@/types/catalogue";

type PdpOptionsProps = {
  variants: VariantOption[];
  selected: VariantOption;
  qualities: QualityItem[];
  colours: ColourItem[];
  onSelect: (axis: VariantAxis, value: string) => void;
  /** "Size", or "Model" for sofas. */
  sizeTitle: string;
};

/** "King · 78 x 72 in", or for sofas "3+1+1 / 3+2 · 5 seats". */
function formatSizeLabel(variant: Pick<VariantOption, "sizeLabel" | "lengthIn" | "widthIn" | "seats">): string {
  if (variant.lengthIn && variant.widthIn) return `${variant.sizeLabel} · ${variant.lengthIn} x ${variant.widthIn} in`;
  if (variant.seats) return `${variant.sizeLabel} · ${variant.seats} seats`;
  return variant.sizeLabel;
}

function chipClass(isSelected: boolean): string {
  return cn(
    "rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
    isSelected ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40",
  );
}

/** Quality, size, thickness and colour chips. Choices not made in the current quality are disabled, not hidden. */
export function PdpOptions({ variants, selected, qualities, colours, onSelect, sizeTitle }: PdpOptionsProps) {
  const choice = toChoice(selected);
  const quality = qualities.find((item) => item.id === selected.qualityId);

  function renderChips(axis: VariantAxis, title: string, getLabel: (variant: VariantOption) => string) {
    const values = listAxisValues(variants, axis);
    if (values.length < 2) return null;
    return (
      <div className="space-y-2">
        <Label>{title}</Label>
        <div className="flex flex-wrap gap-2">
          {values.map(({ value, variant }) => (
            <button
              key={value}
              type="button"
              className={chipClass(choice[axis] === value)}
              disabled={!isChoiceAvailable(variants, choice, axis, value)}
              aria-pressed={choice[axis] === value}
              onClick={() => onSelect(axis, value)}
            >
              {getLabel(variant)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const colourValues = listAxisValues(variants, "colour");

  return (
    <div className="space-y-5">
      {renderChips("quality", "Quality", (variant) => qualities.find((item) => item.id === variant.qualityId)?.name ?? "")}
      {quality?.description || quality?.warrantyYears ? (
        <p className="text-sm text-muted-foreground">
          {quality.description}
          {quality.warrantyYears ? ` · ${quality.warrantyYears}-year warranty` : ""}
        </p>
      ) : null}
      {renderChips("size", sizeTitle, formatSizeLabel)}
      {renderChips("thickness", "Thickness", (variant) => `${variant.thicknessIn} in`)}
      {colourValues.length > 0 ? (
        <div className="space-y-2">
          <Label>Colour / finish</Label>
          <div className="flex flex-wrap gap-3">
            {colourValues.map(({ value }) => {
              const colour = colours.find((item) => item.id === value);
              const isSelected = choice.colour === value;
              return (
                <button
                  key={value}
                  type="button"
                  title={colour?.name}
                  aria-label={colour?.name}
                  aria-pressed={isSelected}
                  disabled={!isChoiceAvailable(variants, choice, "colour", value)}
                  onClick={() => onSelect("colour", value)}
                  className={cn(
                    "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background disabled:opacity-30",
                    isSelected ? "ring-brass" : "ring-transparent",
                  )}
                  style={{ backgroundColor: colour?.hex }}
                />
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">{colours.find((item) => item.id === choice.colour)?.name}</p>
        </div>
      ) : null}
    </div>
  );
}

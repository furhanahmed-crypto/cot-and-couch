import type { VariantOption } from "@/types/catalogue";

/** The four things a customer chooses on the product page. */
export type VariantAxis = "quality" | "size" | "thickness" | "colour";
export type VariantChoice = Record<VariantAxis, string>;

const AXES: VariantAxis[] = ["quality", "size", "thickness", "colour"];

/** "King|78" — size label plus length, so 75 in and 78 in are different sizes. */
export function getSizeKey(variant: Pick<VariantOption, "sizeLabel" | "lengthIn">): string {
  return `${variant.sizeLabel}|${variant.lengthIn ?? ""}`;
}

export function getAxisValue(variant: VariantOption, axis: VariantAxis): string {
  if (axis === "quality") return variant.qualityId ?? "";
  if (axis === "size") return getSizeKey(variant);
  if (axis === "thickness") return String(variant.thicknessIn ?? "");
  return variant.colourId ?? "";
}

export function toChoice(variant: VariantOption): VariantChoice {
  return {
    quality: getAxisValue(variant, "quality"),
    size: getAxisValue(variant, "size"),
    thickness: getAxisValue(variant, "thickness"),
    colour: getAxisValue(variant, "colour"),
  };
}

/**
 * Best variant for a choice. The changed axis wins; the other axes are kept
 * when possible, in the order quality > size > thickness > colour.
 */
export function pickVariant(
  variants: VariantOption[],
  choice: VariantChoice,
  changedAxis?: VariantAxis,
): VariantOption | undefined {
  const order = changedAxis ? [changedAxis, ...AXES.filter((axis) => axis !== changedAxis)] : AXES;
  let pool = variants;
  for (const axis of order) {
    const narrowed = pool.filter((variant) => getAxisValue(variant, axis) === choice[axis]);
    if (narrowed.length) pool = narrowed;
  }
  return pool[0];
}

/** True when some variant matches this value and every axis chosen before it. */
export function isChoiceAvailable(
  variants: VariantOption[],
  choice: VariantChoice,
  axis: VariantAxis,
  value: string,
): boolean {
  const earlierAxes = AXES.slice(0, AXES.indexOf(axis));
  return variants.some(
    (variant) =>
      getAxisValue(variant, axis) === value &&
      earlierAxes.every((earlier) => getAxisValue(variant, earlier) === choice[earlier]),
  );
}

/** Distinct values of one axis, in variant order, with the first variant that has each. */
export function listAxisValues(variants: VariantOption[], axis: VariantAxis) {
  const seen = new Map<string, VariantOption>();
  for (const variant of variants) {
    const value = getAxisValue(variant, axis);
    if (value && !seen.has(value)) seen.set(value, variant);
  }
  return [...seen.entries()].map(([value, variant]) => ({ value, variant }));
}

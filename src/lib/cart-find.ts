import type { CartSummaryLine } from "@/types/cart";

export function sameCustomSize(
  row: { customLengthIn: number | null; customWidthIn: number | null },
  lengthIn: number | null,
  widthIn: number | null,
) {
  return row.customLengthIn === lengthIn && row.customWidthIn === widthIn;
}

export function sameAddonSet(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((id, i) => id === right[i]);
}

export function findSummaryLine(
  lines: CartSummaryLine[],
  productId: string,
  variantId?: string,
  customLengthIn: number | null = null,
  customWidthIn: number | null = null,
  addonIds: string[] = [],
) {
  if (variantId) {
    return (
      lines.find(
        (line) =>
          line.productId === productId &&
          line.variantId === variantId &&
          sameCustomSize(line, customLengthIn, customWidthIn) &&
          sameAddonSet(line.addonIds, addonIds),
      ) ?? null
    );
  }

  return lines.find((line) => line.productId === productId) ?? null;
}

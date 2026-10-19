import type { CartSummaryLine } from "@/types/cart";

export function sameCustomSize(
  row: { customLengthIn: number | null; customWidthIn: number | null },
  lengthIn: number | null,
  widthIn: number | null,
) {
  return row.customLengthIn === lengthIn && row.customWidthIn === widthIn;
}

export function findSummaryLine(
  lines: CartSummaryLine[],
  productId: string,
  variantId?: string,
  customLengthIn: number | null = null,
  customWidthIn: number | null = null,
) {
  if (variantId) {
    return (
      lines.find(
        (line) =>
          line.productId === productId &&
          line.variantId === variantId &&
          sameCustomSize(line, customLengthIn, customWidthIn),
      ) ?? null
    );
  }

  return lines.find((line) => line.productId === productId) ?? null;
}

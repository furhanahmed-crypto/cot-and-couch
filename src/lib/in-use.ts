import { AppError } from "@/lib/action-result";

/** "Used by 3 products. Deactivate it instead." */
function inUseMessage(count: number, noun = "product"): string {
  const label = count === 1 ? noun : `${noun}s`;
  return `Used by ${count} ${label}. Deactivate it instead.`;
}

/** Blocks a delete when something still uses the row. */
export function assertNotInUse(count: number, noun?: string): void {
  if (count > 0) throw new AppError(inUseMessage(count, noun));
}

/** Rows per page on every admin list. */
export const PAGE_SIZE = 20;

/** `?page=` as a whole number ≥ 1. Anything else is page 1. */
export function parsePage(value: string | string[] | undefined): number {
  const page = Number(typeof value === "string" ? value : undefined);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Last page that has rows (at least 1, so an empty list shows page 1). */
export function getLastPage(total: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** A page past the end becomes the last page. */
export function clampPage(page: number, total: number, pageSize: number = PAGE_SIZE): number {
  return Math.min(page, getLastPage(total, pageSize));
}

export function getPageOffset(page: number, pageSize: number = PAGE_SIZE): number {
  return (page - 1) * pageSize;
}

/** "21–40 of 132", or "0 of 0" when empty. */
export function formatPageRange(page: number, total: number, pageSize: number = PAGE_SIZE): string {
  if (total === 0) return "0 of 0";
  const first = getPageOffset(page, pageSize) + 1;
  const last = Math.min(page * pageSize, total);
  return `${first}–${last} of ${total}`;
}

/** One `?key=` value as text; arrays and missing values become "". */
export function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** A value from a fixed list, or the fallback for unknown values. */
export function readChoice<T extends string>(value: string | string[] | undefined, choices: readonly T[], fallback: T): T {
  const text = readParam(value);
  return choices.find((choice) => choice === text) ?? fallback;
}

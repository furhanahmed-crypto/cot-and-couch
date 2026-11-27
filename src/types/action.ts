/** What every server action returns. `ok` tells the caller which shape it got. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

"use client";

import { useSyncExternalStore } from "react";

/** True after client hydration — avoids localStorage/auth flashes. */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

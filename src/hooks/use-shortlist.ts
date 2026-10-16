"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import { getCachedJson, subscribeKey, writeJson } from "@/services/storage";

const KEY = STORAGE_KEYS.shortlist;
const EMPTY: string[] = [];

export function useShortlist() {
  const ids = useSyncExternalStore(
    (onChange) => subscribeKey(KEY, onChange),
    () => getCachedJson<string[]>(KEY, EMPTY),
    () => EMPTY,
  );

  const toggle = useCallback((productId: string) => {
    const prev = getCachedJson<string[]>(KEY, EMPTY);
    writeJson(
      KEY,
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const has = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  return { ids, toggle, has, count: ids.length };
}

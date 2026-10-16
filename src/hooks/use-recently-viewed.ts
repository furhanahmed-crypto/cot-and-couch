"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import { getCachedJson, subscribeKey, writeJson } from "@/services/storage";

const KEY = STORAGE_KEYS.recentlyViewed;
const EMPTY: string[] = [];
const MAX = 16;

export function useRecentlyViewed() {
  const ids = useSyncExternalStore(
    (onChange) => subscribeKey(KEY, onChange),
    () => getCachedJson<string[]>(KEY, EMPTY),
    () => EMPTY,
  );

  const track = useCallback((productId: string) => {
    const prev = getCachedJson<string[]>(KEY, EMPTY);
    writeJson(
      KEY,
      [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX),
    );
  }, []);

  const clear = useCallback(() => {
    writeJson(KEY, EMPTY);
  }, []);

  return { ids, track, clear };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import { readJson, writeJson } from "@/services/storage";

const MAX = 16;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readJson<string[]>(STORAGE_KEYS.recentlyViewed, []));
  }, []);

  const track = useCallback((productId: string) => {
    const prev = readJson<string[]>(STORAGE_KEYS.recentlyViewed, []);
    const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX);
    writeJson(STORAGE_KEYS.recentlyViewed, next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    writeJson(STORAGE_KEYS.recentlyViewed, []);
    setIds([]);
  }, []);

  return { ids, track, clear };
}

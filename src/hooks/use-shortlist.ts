"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import { readJson, writeJson } from "@/services/storage";

export function useShortlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readJson<string[]>(STORAGE_KEYS.shortlist, []));
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    writeJson(STORAGE_KEYS.shortlist, next);
  }, []);

  const toggle = useCallback(
    (productId: string) => {
      persist(
        ids.includes(productId)
          ? ids.filter((id) => id !== productId)
          : [...ids, productId],
      );
    },
    [ids, persist],
  );

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, has, count: ids.length };
}

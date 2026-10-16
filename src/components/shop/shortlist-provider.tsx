"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  getFavouriteIdsAction,
  toggleFavouriteAction,
} from "@/app/(shop)/favourites/actions";

type ShortlistContextValue = {
  ids: string[];
  count: number;
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

/**
 * Shared shortlist. Loads favourites once on the client so shop layout
 * does not block every RSC navigation on auth + DB.
 */
export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getFavouriteIdsAction()
      .then((next) => {
        if (!cancelled) setIds(next);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
    startTransition(async () => {
      const result = await toggleFavouriteAction(productId);
      if (!result.ok) {
        setIds((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId],
        );
        return;
      }
      setIds((prev) => {
        const hasId = prev.includes(productId);
        if (result.liked && !hasId) return [...prev, productId];
        if (!result.liked && hasId) {
          return prev.filter((id) => id !== productId);
        }
        return prev;
      });
    });
  }, []);

  const has = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      ready,
      has,
      toggle,
    }),
    [ids, ready, has, toggle],
  );

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlistContext() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) {
    throw new Error("useShortlist must be used within ShortlistProvider");
  }
  return ctx;
}

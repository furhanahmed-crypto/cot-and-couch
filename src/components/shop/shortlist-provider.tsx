"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toggleFavouriteAction } from "@/app/(shop)/favourites/actions";

type ShortlistContextValue = {
  ids: string[];
  count: number;
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

export function ShortlistProvider({
  initialIds,
  children,
}: {
  initialIds: string[];
  children: React.ReactNode;
}) {
  const [ids, setIds] = useState(initialIds);
  const [, startTransition] = useTransition();

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
      ready: true,
      has,
      toggle,
    }),
    [ids, has, toggle],
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

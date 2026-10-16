"use client";

import { useShortlistContext } from "@/components/shop/shortlist-provider";

/**
 * Shortlist from shared provider (one server load per shop layout — not per card).
 */
export function useShortlist() {
  return useShortlistContext();
}

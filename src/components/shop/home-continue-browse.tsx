"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import { useIsClient } from "@/hooks/use-is-client";
import { getCachedJson, subscribeKey } from "@/services/storage";

type LastBrowse = { path?: string } | null;

export function HomeContinueBrowse() {
  const ready = useIsClient();
  const lastBrowse = useSyncExternalStore(
    (onChange) => subscribeKey(STORAGE_KEYS.lastBrowse, onChange),
    () => getCachedJson<LastBrowse>(STORAGE_KEYS.lastBrowse, null),
    () => null,
  );
  const continuePath = ready ? (lastBrowse?.path ?? null) : null;
  if (!continuePath) return null;

  return (
    <div className="rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm">
      Continue where you left off —{" "}
      <Link
        href={continuePath}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        resume browsing
      </Link>
    </div>
  );
}

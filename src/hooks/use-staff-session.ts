"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import type { StaffSession } from "@/types";
import { clearStaffSession, setStaffSession } from "@/services/session";
import { getCachedJson, subscribeKey } from "@/services/storage";
import { useIsClient } from "@/hooks/use-is-client";

const KEY = STORAGE_KEYS.staffSession;

export function useStaffSession() {
  const ready = useIsClient();
  const stored = useSyncExternalStore(
    (onChange) => subscribeKey(KEY, onChange),
    () => getCachedJson<StaffSession | null>(KEY, null),
    () => null,
  );

  const login = useCallback((next: StaffSession) => {
    setStaffSession(next);
  }, []);

  const logout = useCallback(() => {
    clearStaffSession();
  }, []);

  const session = ready ? stored : null;

  return {
    session,
    ready,
    login,
    logout,
    isAdmin: session?.role === "admin",
    isTeam: session?.role === "team",
  };
}

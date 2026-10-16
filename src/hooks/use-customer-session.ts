"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/constants/routes";
import type { CustomerSession } from "@/types";
import {
  clearCustomerSession,
  setCustomerSession,
} from "@/services/session";
import { getCachedJson, subscribeKey } from "@/services/storage";
import { useIsClient } from "@/hooks/use-is-client";

const KEY = STORAGE_KEYS.customerSession;

export function useCustomerSession() {
  const ready = useIsClient();
  const stored = useSyncExternalStore(
    (onChange) => subscribeKey(KEY, onChange),
    () => getCachedJson<CustomerSession | null>(KEY, null),
    () => null,
  );

  const login = useCallback((next: CustomerSession) => {
    setCustomerSession(next);
  }, []);

  const logout = useCallback(() => {
    clearCustomerSession();
  }, []);

  const session = ready ? stored : null;

  return {
    session,
    ready,
    login,
    logout,
    isLoggedIn: !!session,
  };
}

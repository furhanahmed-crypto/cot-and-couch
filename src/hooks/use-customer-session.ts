"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomerSession } from "@/types";
import {
  clearCustomerSession,
  getCustomerSession,
  setCustomerSession,
} from "@/services/session";

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getCustomerSession());
    setReady(true);
  }, []);

  const login = useCallback((next: CustomerSession) => {
    setCustomerSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearCustomerSession();
    setSession(null);
  }, []);

  return { session, ready, login, logout, isLoggedIn: !!session };
}

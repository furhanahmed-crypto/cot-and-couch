"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StaffSession } from "@/types";
import {
  clearStaffSession,
  getStaffSession,
  setStaffSession,
} from "@/services/session";

type StaffSessionContextValue = {
  session: StaffSession | null;
  ready: boolean;
  login: (next: StaffSession) => void;
  logout: () => void;
  isAdmin: boolean;
  isTeam: boolean;
};

const StaffSessionContext = createContext<StaffSessionContextValue | null>(null);

export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getStaffSession());
    setReady(true);
  }, []);

  const login = useCallback((next: StaffSession) => {
    setStaffSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearStaffSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      ready,
      login,
      logout,
      isAdmin: session?.role === "admin",
      isTeam: session?.role === "team",
    }),
    [session, ready, login, logout],
  );

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession() {
  const ctx = useContext(StaffSessionContext);
  if (!ctx) {
    throw new Error("useStaffSession must be used within StaffSessionProvider");
  }
  return ctx;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useCustomerSession } from "@/hooks/use-customer-session";

const PUBLIC = [ROUTES.login, ROUTES.verify, ROUTES.register, ROUTES.privacy];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, ready } = useCustomerSession();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith("/admin"));

  useEffect(() => {
    if (!ready || isPublic) return;
    if (!session) router.replace(ROUTES.login);
  }, [ready, session, isPublic, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Opening your digital window…
      </div>
    );
  }

  if (!session && !isPublic) return null;
  return <>{children}</>;
}

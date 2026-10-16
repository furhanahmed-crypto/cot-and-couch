"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth/client";
import { getStaffProfile } from "@/services/profile";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === ROUTES.admin.login;
  const { data: session, isPending } = authClient.useSession();
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffOk, setStaffOk] = useState<boolean | null>(isLogin ? true : null);

  useEffect(() => {
    if (isLogin) return;
    if (isPending) return;

    if (!session?.user) {
      router.replace(ROUTES.admin.login);
      return;
    }

    let cancelled = false;
    getStaffProfile().then((profile) => {
      if (cancelled) return;
      if (!profile) {
        router.replace(ROUTES.admin.login);
        setStaffOk(false);
        return;
      }
      setStaffName(profile.name ?? profile.email);
      setStaffOk(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLogin, isPending, session, router]);

  if (isLogin) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  if (isPending || staffOk !== true) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading console…
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <SidebarInset className="bg-stone">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/70 bg-background/90 px-3 backdrop-blur-md md:h-16 md:px-4">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="min-w-0 flex-1 md:hidden">
            <BrandMark href={ROUTES.admin.dashboard} compact className="max-w-[140px]" />
          </div>
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            Team console · {staffName ?? session?.user?.name}
          </p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 md:px-6 md:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

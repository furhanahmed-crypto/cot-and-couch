"use client";

import { useEffect } from "react";
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
import { useStaffSession } from "@/hooks/use-staff-session";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready } = useStaffSession();
  const isLogin = pathname === ROUTES.admin.login;

  useEffect(() => {
    if (!ready) return;
    if (!session && !isLogin) {
      router.replace(ROUTES.admin.login);
    }
  }, [ready, session, isLogin, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading console…
      </div>
    );
  }

  if (isLogin) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Redirecting to login…
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
            Team console · {session.name}
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

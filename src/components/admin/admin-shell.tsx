"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth/client";
import { getStaffProfile } from "@/services/profile";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === ROUTES.admin.login;
  const { data: session, isPending } = authClient.useSession();
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffOk, setStaffOk] = useState<boolean | null>(isLogin ? true : null);

  useEffect(() => {
    if (isLogin || isPending) return;

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

  const ready = !isPending && staffOk === true;

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <SidebarInset className="min-w-0 bg-stone">
        {ready ? (
          <AdminTopbar
            staffName={staffName ?? session?.user?.name ?? "Admin"}
          />
        ) : (
          <header className="flex h-14 items-center border-b border-border/70 px-4 text-sm text-muted-foreground md:h-16">
            Loading console…
          </header>
        )}
        <div
          className={cn(
            "relative mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-4 sm:px-4 md:px-6 md:py-8",
            !ready && "pointer-events-none opacity-40",
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

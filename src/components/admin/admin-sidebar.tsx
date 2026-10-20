"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { BrandMark } from "@/components/shared/brand-mark";
import { LogoMark } from "@/components/shared/logo-mark";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth/client";
import { getStaffProfile } from "@/services/profile";

export function AdminSidebar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { isMobile, setOpenMobile } = useSidebar();
  const [role, setRole] = useState<"admin" | "team" | null>(null);
  const [staffLabel, setStaffLabel] = useState<string>("");

  useEffect(() => {
    getStaffProfile().then((profile) => {
      if (!profile) return;
      setRole(profile.role === "admin" ? "admin" : "team");
      setStaffLabel(profile.name?.trim() || profile.email);
    });
  }, [session?.user?.id]);

  async function handleLogout() {
    await authClient.signOut();
    if (isMobile) setOpenMobile(false);
    router.replace(ROUTES.admin.login);
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div
            className="min-w-0"
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          >
            <BrandMark
              href={ROUTES.admin.dashboard}
              tone="dark"
              compact
              className="max-w-[160px] group-data-[collapsible=icon]:hidden"
            />
            <LogoMark
              href={ROUTES.admin.dashboard}
              tone="dark"
              compact
              className="hidden group-data-[collapsible=icon]:inline-flex"
            />
          </div>
          {isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Close menu"
              onClick={() => setOpenMobile(false)}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        {isMobile && staffLabel ? (
          <p className="mt-2 truncate px-0.5 text-xs text-sidebar-foreground/60">
            {staffLabel}
            {role ? ` · ${role === "admin" ? "Admin" : "Team"}` : ""}
          </p>
        ) : null}
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-y-auto">
        <AdminSidebarNav isAdmin={role === "admin"} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pb-6 md:pb-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={handleLogout}
              className="text-sidebar-foreground/70"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

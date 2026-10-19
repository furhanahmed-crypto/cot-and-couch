"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { BrandMark } from "@/components/shared/brand-mark";
import { LogoMark } from "@/components/shared/logo-mark";
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

  useEffect(() => {
    getStaffProfile().then((profile) => {
      if (!profile) return;
      setRole(profile.role === "admin" ? "admin" : "team");
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
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <AdminSidebarNav isAdmin={role === "admin"} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pb-10">
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

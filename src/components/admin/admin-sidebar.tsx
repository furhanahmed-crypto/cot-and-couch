"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { BrandMark } from "@/components/shared/brand-mark";
import { Badge } from "@/components/ui/badge";
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
  const [label, setLabel] = useState("Staff");

  useEffect(() => {
    getStaffProfile().then((profile) => {
      if (!profile) return;
      setRole(profile.role === "admin" ? "admin" : "team");
      setLabel(profile.name ?? profile.email);
    });
  }, [session?.user?.id]);

  async function handleLogout() {
    await authClient.signOut();
    if (isMobile) setOpenMobile(false);
    router.replace(ROUTES.admin.login);
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="gap-2 border-b border-sidebar-border px-3 py-4">
        <BrandMark
          href={ROUTES.admin.dashboard}
          tone="dark"
          compact
          className="max-w-[150px] group-data-[collapsible=icon]:hidden"
        />
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-xs text-[#C9D6D2]">
            Admin console · Lingampally
          </p>
          <p className="mt-1 truncate text-sm text-sidebar-foreground">{label}</p>
          <Badge
            variant="secondary"
            className="mt-1 capitalize bg-sidebar-accent text-sidebar-accent-foreground"
          >
            {role ?? "…"}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <AdminSidebarNav isAdmin={role === "admin"} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={handleLogout}
              className="text-[#C9D6D2]"
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lock, LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_NAV } from "@/constants/admin-nav";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth/client";
import { getStaffProfile } from "@/services/profile";

export function AdminSidebar() {
  const pathname = usePathname();
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

  const isAdmin = role === "admin";

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
          <p className="truncate text-xs text-sidebar-foreground/70">{label}</p>
          <Badge
            variant="secondary"
            className="mt-1 capitalize bg-sidebar-accent text-sidebar-accent-foreground"
          >
            {role ?? "…"}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Console</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV.map((item) => {
                const locked = Boolean(item.adminOnly && !isAdmin);
                const active =
                  pathname === item.href ||
                  (item.href !== ROUTES.admin.dashboard &&
                    pathname.startsWith(item.href));

                if (locked) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        disabled
                        tooltip={`${item.label} (Admin only)`}
                        className="opacity-50"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                        <Lock className="ml-auto size-3.5 text-brass" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log out" onClick={handleLogout}>
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

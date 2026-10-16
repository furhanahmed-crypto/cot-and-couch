"use client";

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
import { useStaffSession } from "@/hooks/use-staff-session";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, isAdmin } = useStaffSession();
  const { isMobile, setOpenMobile } = useSidebar();

  function handleLogout() {
    logout();
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
          <p className="truncate text-xs text-sidebar-foreground/70">
            {session?.name ?? "Staff"}
          </p>
          <Badge
            variant="secondary"
            className="mt-1 capitalize bg-sidebar-accent text-sidebar-accent-foreground"
          >
            {session?.role ?? "guest"}
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

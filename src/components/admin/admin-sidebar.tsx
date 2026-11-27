"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAdminNav, isNavItemActive } from "@/constants/admin-nav";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth/client";

type AdminSidebarProps = { staffName: string; isAdmin: boolean };

export function AdminSidebar({ staffName, isAdmin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  function closeOnMobile() {
    if (isMobile) setOpenMobile(false);
  }

  async function logOut() {
    await authClient.signOut();
    router.replace(ROUTES.login);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <BrandMark href={ROUTES.admin.root} tone="dark" compact className="max-w-[160px] group-data-[collapsible=icon]:hidden" />
        <p className="truncate text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          {staffName} · {isAdmin ? "Admin" : "Team"}
        </p>
      </SidebarHeader>

      <SidebarContent>
        {getAdminNav(isAdmin).map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isNavItemActive(item.href, pathname)}
                    render={<Link href={item.href} onClick={closeOnMobile} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log out" onClick={logOut} className="text-sidebar-foreground/70">
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

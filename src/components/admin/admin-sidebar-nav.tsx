"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ADMIN_NAV_GROUPS,
  isAdminNavActive,
  type AdminNavItem,
} from "@/constants/admin-nav";

export function AdminSidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {ADMIN_NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label} className="px-2 py-1">
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-[0.06em] text-[#8FA7A2] uppercase">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  locked={Boolean(item.adminOnly && !isAdmin)}
                  active={isAdminNavActive(pathname, item)}
                  onNavigate={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavRow({
  item,
  locked,
  active,
  onNavigate,
}: {
  item: AdminNavItem;
  locked: boolean;
  active: boolean;
  onNavigate: () => void;
}) {
  if (locked) {
    return (
      <SidebarMenuItem>
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
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.label}
        render={<Link href={item.href} />}
        onClick={onNavigate}
        className={
          active
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
        }
      >
        <item.icon />
        <span className="truncate">{item.label}</span>
        {active ? (
          <span
            aria-hidden
            className="ml-auto size-1.5 shrink-0 rounded-full bg-brass"
          />
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

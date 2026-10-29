import {
  FolderTree,
  Images,
  IndianRupee,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  UserCog,
  UsersRound,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { AdminNavGroup, AdminNavItem } from "@/constants/admin-nav-types";

/** Team console navigation — see docs/ARCHITECTURE.md */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: ROUTES.admin.products, label: "Products", icon: Package },
      {
        href: ROUTES.admin.categories,
        label: "Categories",
        icon: FolderTree,
        adminOnly: true,
      },
      {
        href: ROUTES.admin.brands,
        label: "Mattress brands",
        icon: IndianRupee,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: ROUTES.admin.orders, label: "Orders", icon: ShoppingBag },
      { href: ROUTES.admin.leads, label: "Leads", icon: UsersRound },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: ROUTES.admin.gallery,
        label: "Gallery & reels",
        icon: Images,
        matchPrefixes: [ROUTES.admin.reels],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: ROUTES.admin.settings,
        label: "Store settings",
        icon: Settings,
        adminOnly: true,
      },
      {
        href: ROUTES.admin.team,
        label: "Team",
        icon: UserCog,
        adminOnly: true,
      },
    ],
  },
];

export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
  if (pathname === item.href) return true;
  if (item.href !== ROUTES.admin.dashboard && pathname.startsWith(item.href)) {
    return true;
  }
  return (item.matchPrefixes ?? []).some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

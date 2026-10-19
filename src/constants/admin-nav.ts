import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  IndianRupee,
  ShoppingBag,
  UsersRound,
  Images,
  UserCog,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  matchPrefixes?: string[];
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Figma + HTML shell: Overview → Catalogue → Commerce → Content → Admin. */
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
        label: "Categories & templates",
        icon: FolderTree,
        adminOnly: true,
        matchPrefixes: [ROUTES.admin.attributes],
      },
      { href: ROUTES.admin.masters, label: "Masters", icon: Layers, adminOnly: true },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: ROUTES.admin.pricing,
        label: "Pricing & stock",
        icon: IndianRupee,
        adminOnly: true,
        matchPrefixes: [ROUTES.admin.stock],
      },
      { href: ROUTES.admin.sales, label: "Sales & delivery", icon: ShoppingBag },
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
    label: "Admin",
    items: [
      { href: ROUTES.admin.users, label: "Users & roles", icon: UserCog, adminOnly: true },
      { href: ROUTES.admin.settings, label: "Settings", icon: Settings, adminOnly: true },
      { href: ROUTES.admin.audit, label: "Audit log", icon: ScrollText, adminOnly: true },
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

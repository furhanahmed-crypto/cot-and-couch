import {
  Boxes,
  FolderTree,
  Images,
  LayoutDashboard,
  Layers,
  Palette,
  ReceiptText,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hidden from the team role. */
  isAdminOnly?: boolean;
};

export type AdminNavSection = { title: string; items: AdminNavItem[] };

/** Sidebar of the team console. Team users see everything not marked admin-only. */
export const ADMIN_NAV: AdminNavSection[] = [
  { title: "Overview", items: [{ label: "Dashboard", href: ROUTES.admin.root, icon: LayoutDashboard }] },
  {
    title: "Catalogue",
    items: [
      { label: "Products", href: ROUTES.admin.products, icon: Boxes },
      { label: "Categories", href: ROUTES.admin.categories, icon: FolderTree, isAdminOnly: true },
      { label: "Colours", href: ROUTES.admin.colours, icon: Palette, isAdminOnly: true },
      { label: "Collections", href: ROUTES.admin.collections, icon: Layers, isAdminOnly: true },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", href: ROUTES.admin.orders, icon: ReceiptText },
      { label: "Leads", href: ROUTES.admin.leads, icon: UserRound },
    ],
  },
  { title: "Content", items: [{ label: "Media", href: ROUTES.admin.media, icon: Images }] },
  {
    title: "Settings",
    items: [
      { label: "Store", href: ROUTES.admin.settings, icon: Settings, isAdminOnly: true },
      { label: "Team", href: ROUTES.admin.team, icon: Users, isAdminOnly: true },
    ],
  },
];

/** Sections and items this role may see; empty sections are dropped. */
export function getAdminNav(isAdmin: boolean): AdminNavSection[] {
  return ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => isAdmin || !item.isAdminOnly),
  })).filter((section) => section.items.length > 0);
}

/** Dashboard matches only itself; other items also match their sub-pages. */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === ROUTES.admin.root) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

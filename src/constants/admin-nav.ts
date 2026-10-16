import {
  LayoutDashboard,
  FolderTree,
  SlidersHorizontal,
  Package,
  Layers,
  IndianRupee,
  Boxes,
  Images,
  Film,
  ShoppingBag,
  UsersRound,
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
};

/** Nav mirrors Phase 1 PDF admin modules AD-01–AD-13 (no extras). */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.admin.categories, label: "Categories", icon: FolderTree, adminOnly: true },
  { href: ROUTES.admin.attributes, label: "Attributes", icon: SlidersHorizontal, adminOnly: true },
  { href: ROUTES.admin.products, label: "Products", icon: Package },
  { href: ROUTES.admin.masters, label: "Masters", icon: Layers, adminOnly: true },
  { href: ROUTES.admin.pricing, label: "Pricing", icon: IndianRupee, adminOnly: true },
  { href: ROUTES.admin.stock, label: "Stock", icon: Boxes },
  { href: ROUTES.admin.gallery, label: "Gallery", icon: Images },
  { href: ROUTES.admin.reels, label: "Reels", icon: Film },
  { href: ROUTES.admin.sales, label: "Sales", icon: ShoppingBag },
  { href: ROUTES.admin.leads, label: "Leads", icon: UsersRound },
  { href: ROUTES.admin.users, label: "Users", icon: UserCog, adminOnly: true },
  { href: ROUTES.admin.settings, label: "Settings", icon: Settings, adminOnly: true },
  { href: ROUTES.admin.audit, label: "Audit", icon: ScrollText, adminOnly: true },
];

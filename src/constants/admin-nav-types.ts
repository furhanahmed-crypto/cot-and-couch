import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  matchPrefixes?: string[];
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

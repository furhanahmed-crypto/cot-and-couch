"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AdminShellProps = { staffName: string; isAdmin: boolean; children: ReactNode };

/** Espresso sidebar (a sheet on mobile), slim top bar, content on cream. */
export function AdminShell({ staffName, isAdmin, children }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar staffName={staffName} isAdmin={isAdmin} />
      <SidebarInset className="min-w-0 bg-stone">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/70 bg-background/95 px-4 backdrop-blur-md md:px-6">
          <SidebarTrigger aria-label="Toggle menu" />
          <p className="font-heading text-base">Team console</p>
          <div className="ml-auto flex items-center gap-1">
            <Link href={ROUTES.home} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}>
              View shop <ExternalLink className="size-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full min-w-0 max-w-7xl flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

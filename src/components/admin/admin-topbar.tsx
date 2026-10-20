"use client";

import Link from "next/link";
import { ExternalLink, Menu, PanelLeft } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AdminTopbar({ staffName }: { staffName: string }) {
  const first = staffName.split(/\s+/)[0] || staffName;
  const { toggleSidebar, setOpenMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-14 min-w-0 items-center gap-2 border-b border-border/70 bg-background/95 px-3 backdrop-blur-md sm:gap-3 md:h-16 md:px-5">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="shrink-0 md:hidden"
        aria-label="Open menu"
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden shrink-0 md:inline-flex"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
      >
        <PanelLeft className="size-4" />
      </Button>

      <div className="min-w-0 flex-1 md:hidden">
        <BrandMark
          href={ROUTES.admin.dashboard}
          compact
          className="max-w-[140px]"
        />
      </div>
      <div className="hidden min-w-0 flex-1 md:block">
        <p className="truncate font-heading text-lg text-ink">
          {greetingForNow()}, {first}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Team console · Cot & Couch
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          className="sm:hidden"
          nativeButton={false}
          render={<Link href={ROUTES.home} target="_blank" rel="noreferrer" />}
          aria-label="View store"
        >
          <ExternalLink className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href={ROUTES.home} target="_blank" rel="noreferrer" />}
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden lg:inline">View store</span>
          <span className="lg:hidden">Store</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

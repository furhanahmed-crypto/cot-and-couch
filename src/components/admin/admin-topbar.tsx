"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AdminTopbar({ staffName }: { staffName: string }) {
  const first = staffName.split(/\s+/)[0] || staffName;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/70 bg-background/95 px-3 backdrop-blur-md md:h-16 md:px-5">
      <SidebarTrigger aria-label="Toggle navigation" />
      <div className="min-w-0 flex-1 md:hidden">
        <BrandMark href={ROUTES.admin.dashboard} compact className="max-w-[140px]" />
      </div>
      <div className="hidden min-w-0 flex-1 md:block">
        <p className="truncate font-heading text-lg text-ink">
          {greetingForNow()}, {first}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Team console · Cot & Couch
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        render={<Link href={ROUTES.home} target="_blank" rel="noreferrer" />}
      >
        <ExternalLink className="size-3.5" />
        View store
      </Button>
      <ThemeToggle />
    </header>
  );
}

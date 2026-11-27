"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ShopNavLink } from "@/components/shop/shop-nav-link";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { CategoryItem } from "@/types/catalogue";

/** The category menu on small screens. */
export function ShopMobileMenu({ categories }: { categories: CategoryItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0 lg:hidden")} aria-label="Open menu">
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle className="font-heading">Browse</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 p-3">
          {categories.map((category) => (
            <ShopNavLink
              key={category.id}
              href={ROUTES.category(category.slug)}
              className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {category.name}
            </ShopNavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ShopAccountMenu } from "@/components/shop/shop-account-menu";
import { ShopMobileMenu } from "@/components/shop/shop-mobile-menu";
import { ShopNavLink } from "@/components/shop/shop-nav-link";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";
import type { CategoryItem } from "@/types/catalogue";

const MAX_BADGE = 99;

type IconLinkProps = { href: string; label: string; count?: number; children: ReactNode };

/** Header icon button, with a count bubble when `count` > 0. */
function IconLink({ href, label, count = 0, children }: IconLinkProps) {
  return (
    <Link href={href} prefetch className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")} aria-label={label}>
      {children}
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
        </span>
      ) : null}
    </Link>
  );
}

export function ShopHeader({ categories }: { categories: CategoryItem[] }) {
  const shortlistCount = useShopStore((state) => state.shortlistIds.length);
  const cartCount = useShopStore((state) => state.cartCount);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:h-16 md:px-6">
        <ShopMobileMenu categories={categories} />
        <BrandMark className="min-w-0 max-w-[42vw] sm:max-w-none" />
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {categories.map((category) => (
            <ShopNavLink
              key={category.id}
              href={ROUTES.category(category.slug)}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {category.name}
            </ShopNavLink>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <IconLink href={ROUTES.search} label="Search">
            <Search className="size-4" />
          </IconLink>
          <IconLink href={ROUTES.shortlist} label="Shortlist" count={shortlistCount}>
            <Heart className="size-4" />
          </IconLink>
          <IconLink href={ROUTES.cart} label={`Shopping cart with ${cartCount} items`} count={cartCount}>
            <ShoppingCart className="size-4" />
          </IconLink>
          <ThemeToggle />
          <ShopAccountMenu />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LogOut, Menu, Search, ShoppingCart, User } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ShopNavLink } from "@/components/shop/shop-nav-link";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useShortlist } from "@/hooks/use-shortlist";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function ShopHeader({ categories }: { categories: Category[] }) {
  const cats = categories;
  const { data: session } = authClient.useSession();
  const { count } = useShortlist();
  const { count: cartCount } = useCart();
  const { clear } = useRecentlyViewed();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:h-16 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "shrink-0 lg:hidden",
            )}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
            <SheetHeader className="border-b border-border px-4 py-4 text-left">
              <SheetTitle className="font-heading">Browse</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 p-3">
              {cats.map((c) => (
                <ShopNavLink
                  key={c.id}
                  href={ROUTES.category(c.slug)}
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {c.name}
                </ShopNavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <BrandMark className="min-w-0 max-w-[42vw] sm:max-w-none" />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {cats.map((c) => (
            <ShopNavLink
              key={c.id}
              href={ROUTES.category(c.slug)}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {c.name}
            </ShopNavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            href={ROUTES.search}
            prefetch
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Search"
          >
            <Search className="size-4" />
          </Link>
          <Link
            href={ROUTES.shortlist}
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
            aria-label="Shortlist"
          >
            <Heart className="size-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={ROUTES.cart}
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Account menu"
            >
              <User className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user.name}
                    <div className="truncate">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    nativeButton={false}
                    render={<Link href={ROUTES.orders} prefetch />}
                  >
                    My orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    nativeButton={false}
                    render={<Link href={ROUTES.shortlist} prefetch />}
                  >
                    My shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    nativeButton={false}
                    render={<Link href={ROUTES.cart} prefetch />}
                  >
                    My cart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={clear}>
                    Clear browse history
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await authClient.signOut();
                      router.push(ROUTES.login);
                    }}
                  >
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  nativeButton={false}
                  render={<Link href={ROUTES.login} prefetch />}
                >
                  Log in
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={ROUTES.privacy} prefetch />}
              >
                Privacy notice
              </DropdownMenuItem>
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={ROUTES.admin.dashboard} prefetch />}
              >
                Staff console
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

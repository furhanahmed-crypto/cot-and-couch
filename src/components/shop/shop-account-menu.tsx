"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { authClient } from "@/lib/auth/client";

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <DropdownMenuItem nativeButton={false} render={<Link href={href} prefetch />}>
      {label}
    </DropdownMenuItem>
  );
}

/** The person icon: account links, browse history, log in / out. */
export function ShopAccountMenu() {
  const { data: session } = authClient.useSession();
  const { clear } = useRecentlyViewed();
  const router = useRouter();
  const user = session?.user;

  async function logOut() {
    await authClient.signOut();
    router.push(ROUTES.login);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Account menu">
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
            <MenuLink href={ROUTES.orders} label="My orders" />
            <MenuLink href={ROUTES.shortlist} label="My shortlist" />
            <MenuLink href={ROUTES.cart} label="My cart" />
            <DropdownMenuItem onClick={clear}>Clear browse history</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logOut}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </>
        ) : (
          <MenuLink href={ROUTES.login} label="Log in" />
        )}
        <MenuLink href={ROUTES.privacy} label="Privacy notice" />
        <MenuLink href={ROUTES.admin.root} label="Staff console" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

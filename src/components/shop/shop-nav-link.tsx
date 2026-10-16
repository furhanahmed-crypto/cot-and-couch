"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

function ShopNavLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn(pending && "text-foreground")}>{children}</span>
  );
}

export function ShopNavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} prefetch className={className} onClick={onClick}>
      <ShopNavLabel>{children}</ShopNavLabel>
    </Link>
  );
}

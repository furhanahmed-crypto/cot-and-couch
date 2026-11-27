"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShortlist } from "@/hooks/use-shortlist";
import { cn } from "@/lib/utils";

type ShortlistButtonProps = {
  productId: string;
  className?: string;
  /** Refresh the page after a change (the shortlist page itself). */
  refreshOnChange?: boolean;
};

export function ShortlistButton({ productId, className, refreshOnChange = false }: ShortlistButtonProps) {
  const router = useRouter();
  const { isShortlisted, toggle, isPending } = useShortlist(productId, refreshOnChange ? router.refresh : undefined);

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className={cn("rounded-full", className)}
      aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
      aria-pressed={isShortlisted}
      disabled={isPending}
      onClick={toggle}
    >
      <Heart className={cn("size-4", isShortlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}

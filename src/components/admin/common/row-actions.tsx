"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowAction = {
  label: string;
  /** Go to a page… */
  href?: string;
  /** …or run something (usually opens a ConfirmationModal). */
  onSelect?: () => void;
  isDestructive?: boolean;
  isDisabled?: boolean;
};

/** The "…" menu at the end of a table row. Destructive actions go last, after a line. */
export function RowActions({ actions, label }: { actions: RowAction[]; label: string }) {
  const router = useRouter();
  const normal = actions.filter((action) => !action.isDestructive);
  const destructive = actions.filter((action) => action.isDestructive);

  function renderItem(action: RowAction) {
    return (
      <DropdownMenuItem
        key={action.label}
        variant={action.isDestructive ? "destructive" : "default"}
        disabled={action.isDisabled}
        onClick={() => (action.href ? router.push(action.href) : action.onSelect?.())}
      >
        {action.label}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))} aria-label={`Actions for ${label}`}>
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {normal.map(renderItem)}
        {normal.length && destructive.length ? <DropdownMenuSeparator /> : null}
        {destructive.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

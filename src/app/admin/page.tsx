import Link from "next/link";
import { Hammer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/** Placeholder while the admin is rebuilt on the new database (refactor Phases 4–7). */
export default function AdminPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <Hammer className="size-10 text-brass" />
      <h1 className="font-heading text-2xl">Being rebuilt</h1>
      <p className="text-sm text-muted-foreground">
        The team console is moving to the new database. It will be back soon.
      </p>
      <Link href={ROUTES.home} className={cn(buttonVariants({ variant: "outline" }))}>
        Back to the shop
      </Link>
    </div>
  );
}

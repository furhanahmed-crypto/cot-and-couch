import Link from "next/link";
import { Hammer } from "lucide-react";
import { EmptyState } from "@/components/admin/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

/**
 * Temporary: any admin screen not rebuilt yet (refactor Phases 5–7) lands here.
 * Real routes take priority over this catch-all. Delete it in Phase 7.
 */
export default function NotRebuiltYetPage() {
  return (
    <EmptyState
      icon={Hammer}
      title="Being rebuilt"
      description="This screen is moving to the new database and will be back soon."
      action={
        <Link href={ROUTES.admin.root} className={buttonVariants({ variant: "outline" })}>
          Back to dashboard
        </Link>
      }
    />
  );
}

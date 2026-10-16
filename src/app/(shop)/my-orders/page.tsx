import { Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { OrdersPageSkeleton } from "@/components/shop/shop-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/auth/profile";

async function OrdersContent() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Sign in to view orders.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Orders</p>
        <h1 className="font-heading text-3xl">My orders</h1>
        <p className="text-sm text-muted-foreground">
          {profile.name ?? "Customer"} · {profile.email}
        </p>
      </div>

      <div className="rounded-xl border border-dashed p-10 text-center">
        <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Orders stay on mock CRM until the sales tables land. Phone OTP will
          link showroom orders to this profile.
        </p>
        <Link
          href={ROUTES.catalogue}
          prefetch
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-4 inline-flex",
          )}
        >
          Browse catalogue
        </Link>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}

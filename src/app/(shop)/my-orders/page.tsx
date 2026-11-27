import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { OrdersPageSkeleton } from "@/components/shop/shop-skeletons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/constants/orders";
import { ROUTES } from "@/constants/routes";
import { getCurrentProfile } from "@/lib/auth/profile";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listOrdersForProfile } from "@/services/orders/queries";
import type { OrderSummary } from "@/types/shop";

function OrderCard({ order }: { order: OrderSummary }) {
  const balance = order.subtotal - order.advancePaid;
  return (
    <article className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">Ordered {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>
      <ul className="space-y-1 text-sm">
        {order.items.map((item, position) => (
          <li key={position} className="flex justify-between gap-3">
            <span>
              {item.quantity} x {item.productName}
              <span className="block text-xs text-muted-foreground">
                {[item.qualityName, item.sizeLabel, item.colourName, ...item.addonNames].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-sm">
        <span>Total {formatPrice(order.subtotal)}</span>
        <span className="text-muted-foreground">
          Paid {formatPrice(order.advancePaid)} · Balance {formatPrice(balance)}
        </span>
      </div>
      {order.expectedDelivery ? (
        <p className="text-xs text-muted-foreground">Expected delivery {formatDate(order.expectedDelivery)}</p>
      ) : null}
    </article>
  );
}

async function OrdersContent() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(ROUTES.login);
  const orders = await listOrdersForProfile(profile.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Orders</p>
        <h1 className="font-heading text-3xl">My orders</h1>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet. Orders placed at the showroom appear here.</p>
          <Link href={ROUTES.catalogue} className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}>
            Browse catalogue
          </Link>
        </div>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
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

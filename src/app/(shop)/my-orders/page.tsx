"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { sales } from "@/data/mock";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { formatINR } from "@/lib/format";
import { getProductById } from "@/services/catalogue";
import type { OrderStatus } from "@/types";

const statusLabel: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  in_production: "In production",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  closed: "Closed",
  issue: "Needs attention",
};

export default function MyOrdersPage() {
  const { session, ready, isLoggedIn } = useCustomerSession();

  const orders = ready && session
    ? sales.filter((o) => o.customerMobile === session.mobile)
    : [];

  if (!ready) {
    return <p className="p-8 text-center text-muted-foreground">Loading orders…</p>;
  }

  if (!isLoggedIn || !session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-muted-foreground">Sign in to view orders linked to your mobile.</p>
        <Link
          href={ROUTES.login}
          className={cn(
            buttonVariants(),
            "mt-4 inline-flex bg-brass text-ink hover:bg-brass/90",
          )}
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Orders</p>
        <h1 className="font-heading text-3xl">My orders</h1>
        <p className="text-sm text-muted-foreground">
          Read-only view for {session.name} · {session.mobile}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No orders on file for this number yet.</p>
          <Link
            href={ROUTES.catalogue}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Browse catalogue
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const product = getProductById(order.productId);
            const variant = product?.variants.find((v) => v.id === order.variantId);
            return (
              <li key={order.id}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <CardTitle className="text-base font-medium">
                      {product?.name ?? order.productId}
                    </CardTitle>
                    <Badge variant="outline">{statusLabel[order.status]}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {variant && (
                      <p className="text-muted-foreground">SKU {variant.sku}</p>
                    )}
                    <p>
                      Agreed price: <strong>{formatINR(order.agreedPrice)}</strong>
                      {" · "}
                      Advance paid: {formatINR(order.advancePaid)}
                    </p>
                    <p className="text-muted-foreground">
                      Expected delivery: {order.expectedDelivery} · Handled by {order.salesperson}
                    </p>
                    <p className="text-muted-foreground">{order.address}</p>
                    {product && (
                      <Link
                        href={ROUTES.product(product.slug)}
                        className="text-brass underline-offset-2 hover:underline"
                      >
                        View product
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

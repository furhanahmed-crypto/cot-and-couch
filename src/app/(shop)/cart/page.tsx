import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { CartClearButton } from "@/components/shop/cart-clear-button";
import { CartLineCard } from "@/components/shop/cart-line-card";
import { ShortlistPageSkeleton } from "@/components/shop/shop-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listCartItems } from "@/services/cart";
import { getStoreInfo } from "@/services/ops";

async function CartContent() {
  await connection();
  const [lines, storeInfo] = await Promise.all([
    listCartItems(),
    getStoreInfo(),
  ]);

  const lineCount = lines.length;
  const unitCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => {
      const addons = line.addons.reduce((s, a) => s + a.price, 0);
      return sum + (line.variant.price + addons) * line.quantity;
    },
    0,
  );

  const whatsappText = encodeURIComponent(
    `Hi Cot & Couch, I'd like help with items in my cart (${lineCount} product${lineCount === 1 ? "" : "s"}).`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass">Cart</p>
          <h1 className="font-heading text-3xl">My cart</h1>
          <p className="text-sm text-muted-foreground">
            {lineCount} product{lineCount === 1 ? "" : "s"}
            {unitCount !== lineCount ? ` · ${unitCount} units` : ""} in cart
          </p>
        </div>
        {lines.length > 0 ? <CartClearButton /> : null}
      </div>

      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <ShoppingCart className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            href={ROUTES.catalogue}
            prefetch
            className={cn(
              buttonVariants(),
              "mt-4 inline-flex bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Browse catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-3">
            {lines.map((line) => (
              <CartLineCard key={line.id} line={line} />
            ))}
          </div>

          <aside className="h-fit space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/60">
            <h2 className="font-heading text-xl">Order summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No online checkout yet. Keep items here and contact the showroom
              when you are ready.
            </p>
            <a
              href={`https://wa.me/${storeInfo.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants(),
                "w-full bg-[#25D366] text-white hover:bg-[#25D366]/90",
              )}
            >
              <MessageCircle className="size-4" />
              WhatsApp about my cart
            </a>
            <Link
              href={ROUTES.catalogue}
              prefetch
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Continue browsing
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<ShortlistPageSkeleton />}>
      <CartContent />
    </Suspense>
  );
}

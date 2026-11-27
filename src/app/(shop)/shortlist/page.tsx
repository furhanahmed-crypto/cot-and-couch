import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ShortlistShare } from "@/components/shop/shortlist-share";
import { ShortlistPageSkeleton } from "@/components/shop/shop-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getCurrentProfile } from "@/lib/auth/profile";
import { cn } from "@/lib/utils";
import { getStoreInfo } from "@/services/settings/queries";
import { listShortlistCards } from "@/services/shortlist/queries";

async function ShortlistContent() {
  await connection();
  const profile = await getCurrentProfile();
  if (!profile) redirect(ROUTES.login);
  const [cards, storeInfo] = await Promise.all([listShortlistCards(profile.id), getStoreInfo()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass">Saved</p>
          <h1 className="font-heading text-3xl">Shortlist</h1>
          <p className="text-sm text-muted-foreground">{cards.length} items</p>
        </div>
        {cards.length > 0 ? <ShortlistShare products={cards} /> : null}
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No saved products yet.</p>
          <Link href={ROUTES.catalogue} className={cn(buttonVariants(), "mt-4 inline-flex")}>
            Browse catalogue
          </Link>
          {storeInfo.whatsapp ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Need help?{" "}
              <a href={`https://wa.me/${storeInfo.whatsapp}`} className="inline-flex items-center gap-1 text-brass underline-offset-2 hover:underline">
                <MessageCircle className="size-3" /> WhatsApp us
              </a>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <ProductCard key={card.id} card={card} refreshOnShortlistChange />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShortlistPage() {
  return (
    <Suspense fallback={<ShortlistPageSkeleton />}>
      <ShortlistContent />
    </Suspense>
  );
}

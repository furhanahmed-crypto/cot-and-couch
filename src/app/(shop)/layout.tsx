import { ShopHeader } from "@/components/shop/shop-header";
import { ShortlistProvider } from "@/components/shop/shortlist-provider";
import { BrandMark } from "@/components/shared/brand-mark";
import { getCategories } from "@/services/catalogue";
import { getFavouriteIdsForCurrentUser } from "@/services/favourites";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, favouriteIds] = await Promise.all([
    getCategories(),
    getFavouriteIdsForCurrentUser(),
  ]);

  

  return (
    <ShortlistProvider initialIds={favouriteIds}>
      <ShopHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-3 text-center sm:px-4">
          <BrandMark href="/" compact />
          <p className="text-xs text-muted-foreground">
            Lingampally · Digital window (Neon Auth)
          </p>
        </div>
      </footer>
    </ShortlistProvider>
  );
}

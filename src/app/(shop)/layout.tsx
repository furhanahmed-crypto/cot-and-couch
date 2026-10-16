import { AuthGate } from "@/components/shop/auth-gate";
import { ShopHeader } from "@/components/shop/shop-header";
import { BrandMark } from "@/components/shared/brand-mark";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-3 text-center sm:px-4">
          <BrandMark href="/" compact />
          <p className="text-xs text-muted-foreground">
            Lingampally · Phase 1 digital window prototype (mock data)
          </p>
        </div>
      </footer>
    </AuthGate>
  );
}

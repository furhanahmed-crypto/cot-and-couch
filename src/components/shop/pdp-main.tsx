"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { PdpAddons } from "@/components/shop/pdp-addons";
import { NO_CUSTOM_SIZE, PdpCustomSize, type CustomSize } from "@/components/shop/pdp-custom-size";
import { PdpGallery } from "@/components/shop/pdp-gallery";
import { PdpNotes } from "@/components/shop/pdp-notes";
import { PdpOptions } from "@/components/shop/pdp-options";
import { ShortlistButton } from "@/components/shop/shortlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryNotes, getSizeAxisLabel } from "@/constants/categories";
import { useActionToast } from "@/hooks/use-action-toast";
import { discountPercent, formatPrice } from "@/lib/format";
import { getAddonUnitPrice, getUnitTotal, listOfferedAddons } from "@/lib/pricing";
import { pickVariant, toChoice, type VariantAxis } from "@/lib/variant-picker";
import { useShopStore } from "@/stores/shop-store";
import type { ProductDetail } from "@/types/catalogue";

type PdpMainProps = { product: ProductDetail; initialQualityId?: string };

function toInches(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

export function PdpMain({ product, initialQualityId }: PdpMainProps) {
  const { variants } = product;
  const [variantId, setVariantId] = useState(
    () => variants.find((variant) => variant.qualityId === initialQualityId)?.id ?? variants[0]?.id,
  );
  const [chosenAddonIds, setChosenAddonIds] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState<CustomSize>(NO_CUSTOM_SIZE);
  const setCartCount = useShopStore((state) => state.setCartCount);
  const { run, isPending } = useActionToast();

  const variant = variants.find((item) => item.id === variantId) ?? variants[0];
  if (!variant) return <p className="text-muted-foreground">This product has no options on sale right now.</p>;

  const offeredAddons = listOfferedAddons(product.addons, variant);
  // A chosen add-on that the new size or quality does not offer is simply dropped.
  const selectedAddons = offeredAddons.filter((addon) => chosenAddonIds.includes(addon.id));
  const addonTotal = getUnitTotal(0, selectedAddons.map((addon) => getAddonUnitPrice(addon, variant) ?? 0));
  const canCustomSize = variant.lengthIn !== null;

  function selectOption(axis: VariantAxis, value: string) {
    const next = pickVariant(variants, { ...toChoice(variant), [axis]: value }, axis);
    if (next) setVariantId(next.id);
  }

  function toggleAddon(addonId: string) {
    setChosenAddonIds((ids) => (ids.includes(addonId) ? ids.filter((id) => id !== addonId) : [...ids, addonId]));
  }

  function addToCart() {
    const isCustom = canCustomSize && customSize.isOn;
    const input = {
      variantId: variant.id,
      addonIds: selectedAddons.map((addon) => addon.id),
      customLengthIn: isCustom ? toInches(customSize.lengthIn) : null,
      customWidthIn: isCustom ? toInches(customSize.widthIn) : null,
    };
    run(
      () => addToCartAction(input),
      { loading: "Adding to cart…", success: "Added to cart", error: "Could not add to cart" },
      (data) => setCartCount(data.cartCount),
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
      <div className="lg:sticky lg:top-24">
        <PdpGallery images={product.images.map((image) => image.url)} alt={product.name} />
      </div>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {product.brandName ? <p className="text-sm text-muted-foreground">{product.brandName}</p> : null}
            <h1 className="font-heading text-2xl leading-tight md:text-3xl">{product.name}</h1>
          </div>
          <ShortlistButton productId={product.id} className="size-10 shrink-0" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold text-brass">{formatPrice(variant.price + addonTotal)}</span>
            {variant.mrp && variant.mrp > variant.price ? (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(variant.mrp + addonTotal)}</span>
                <Badge className="bg-brass/15 text-ink hover:bg-brass/15">{discountPercent(variant.mrp, variant.price)}% off</Badge>
              </>
            ) : null}
          </div>
          {addonTotal > 0 ? <p className="text-xs text-muted-foreground">Includes {formatPrice(addonTotal)} in add-ons</p> : null}
        </div>

        <div className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-border/60">
          <PdpOptions variants={variants} selected={variant} qualities={product.qualities} colours={product.colours} onSelect={selectOption} sizeTitle={getSizeAxisLabel(product.categorySlug)} />
          <PdpAddons addons={offeredAddons} variant={variant} selectedIds={chosenAddonIds} onToggle={toggleAddon} />
          {canCustomSize ? <PdpCustomSize value={customSize} onChange={setCustomSize} /> : null}
          <p className="text-xs text-muted-foreground">SKU {variant.sku}</p>
          <Button type="button" size="lg" className="w-full" disabled={isPending} onClick={addToCart}>
            <ShoppingCart className="size-4" />
            {isPending ? "Adding…" : "Add to cart"}
          </Button>
        </div>
        <PdpNotes notes={getCategoryNotes(product.categorySlug)} />
      </div>
    </div>
  );
}

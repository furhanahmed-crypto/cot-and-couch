"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartQuantityControls } from "@/components/shop/cart-quantity-controls";
import { PdpBedAddons } from "@/components/shop/pdp-bed-addons";
import { useCart } from "@/hooks/use-cart";
import { useShortlist } from "@/hooks/use-shortlist";
import { discountPercent, formatINR, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productColours } from "@/lib/catalogue-utils";
import { resolveShopBedAddons } from "@/constants/bed-pricing";
import type { Colour, Product, Variant } from "@/types";
import { PdpDetails } from "./pdp-details";
import { PdpGallery } from "./pdp-gallery";

type BedAddonRow = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
};

type Axis = {
  sizeGroupOptionId: string;
  sizeDimensionId: string | null;
  thicknessOptionId: string | null;
  colourId: string;
};

function uniqueBy<T>(items: T[], key: (t: T) => string) {
  const map = new Map<string, T>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, item);
  }
  return [...map.values()];
}

function findVariant(variants: Variant[], axis: Axis): Variant | undefined {
  return variants.find(
    (v) =>
      v.sizeGroupOptionId === axis.sizeGroupOptionId &&
      (v.sizeDimensionId ?? null) === (axis.sizeDimensionId ?? null) &&
      (v.thicknessOptionId ?? null) === (axis.thicknessOptionId ?? null) &&
      v.colourId === axis.colourId,
  );
}

/** Resolve SKU; when an axis is missing, keep other selections and fall back gracefully. */
function resolveVariant(variants: Variant[], axis: Axis): Variant {
  return (
    findVariant(variants, axis) ??
    variants.find(
      (v) =>
        v.sizeGroupOptionId === axis.sizeGroupOptionId &&
        (v.sizeDimensionId ?? null) === (axis.sizeDimensionId ?? null) &&
        (v.thicknessOptionId ?? null) === (axis.thicknessOptionId ?? null),
    ) ??
    variants.find(
      (v) =>
        v.sizeGroupOptionId === axis.sizeGroupOptionId &&
        (v.sizeDimensionId ?? null) === (axis.sizeDimensionId ?? null),
    ) ??
    variants.find((v) => v.sizeGroupOptionId === axis.sizeGroupOptionId) ??
    variants[0]
  );
}

function chipClass(active: boolean) {
  return cn(
    "rounded-md border px-3 py-2 text-sm transition-colors",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background hover:border-foreground/40",
  );
}

function parseCustomInches(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function PdpMain({
  product,
  colours,
  bedAddonRows = [],
}: {
  product: Product;
  colours: Colour[];
  /** Kept for call-site compat; dimensions come from variants. */
  sizes?: unknown;
  /** Raw category addons for beds (prices resolved per range). */
  bedAddonRows?: BedAddonRow[];
}) {
  const variants = product.variants;
  const initial = variants[0];
  const swatches = productColours(product);
  const { has, toggle } = useShortlist();
  const { addItem, findLine } = useCart();
  const liked = has(product.id);
  const [pending, startTransition] = useTransition();
  const isBed = Boolean(product.bedRangeId);

  const [axis, setAxis] = useState<Axis>(() => ({
    sizeGroupOptionId: initial?.sizeGroupOptionId ?? "",
    sizeDimensionId: initial?.sizeDimensionId ?? null,
    thicknessOptionId: initial?.thicknessOptionId ?? null,
    colourId: initial?.colourId ?? "",
  }));
  const [customLength, setCustomLength] = useState("");
  const [customWidth, setCustomWidth] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const sizeGroups = useMemo(
    () =>
      uniqueBy(variants, (v) => v.sizeGroupOptionId).map((v) => ({
        id: v.sizeGroupOptionId,
        label: v.sizeGroupLabel,
        slug: v.sizeGroupSlug,
        isCustom: v.isCustomSize,
      })),
    [variants],
  );

  const dimensions = useMemo(() => {
    return uniqueBy(
      variants.filter(
        (v) =>
          v.sizeGroupOptionId === axis.sizeGroupOptionId &&
          !v.isCustomSize &&
          v.sizeDimensionId,
      ),
      (v) => v.sizeDimensionId!,
    ).map((v) => ({
      id: v.sizeDimensionId!,
      label: v.sizeDimensionLabel ?? v.sizeDimensionId!,
    }));
  }, [variants, axis.sizeGroupOptionId]);

  const thicknesses = useMemo(() => {
    return uniqueBy(
      variants.filter(
        (v) =>
          v.sizeGroupOptionId === axis.sizeGroupOptionId &&
          (v.isCustomSize ||
            (v.sizeDimensionId ?? null) === (axis.sizeDimensionId ?? null)) &&
          v.thicknessOptionId,
      ),
      (v) => v.thicknessOptionId!,
    ).map((v) => ({
      id: v.thicknessOptionId!,
      label: v.thicknessLabel ?? v.thicknessOptionId!,
    }));
  }, [variants, axis.sizeGroupOptionId, axis.sizeDimensionId]);

  const hasThickness = thicknesses.length > 0;
  const isCustomGroup =
    sizeGroups.find((g) => g.id === axis.sizeGroupOptionId)?.isCustom ?? false;

  const variant = resolveVariant(variants, axis);
  const galleryImages =
    variant.images.length > 0
      ? variant.images
      : (variants.find((v) => v.images.length)?.images ?? []);
  const off = discountPercent(variant.mrp, variant.price);

  const bedAddons = useMemo(() => {
    if (!isBed || !bedAddonRows.length) return [];
    return resolveShopBedAddons({
      rows: bedAddonRows,
      rangeSlug: product.bedRangeSlug ?? null,
      cotType: product.cotType ?? null,
      widthSlug: variant.sizeGroupSlug || null,
    });
  }, [
    isBed,
    bedAddonRows,
    product.bedRangeSlug,
    product.cotType,
    variant.sizeGroupSlug,
  ]);

  useEffect(() => {
    const allowed = new Set(bedAddons.map((a) => a.id));
    setSelectedAddonIds((ids) => ids.filter((id) => allowed.has(id)));
  }, [bedAddons]);

  const addonExtra = bedAddons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const displayPrice = variant.price + addonExtra;
  const displayMrp = variant.mrp + addonExtra;

  const selectedCustomLength = isCustomGroup
    ? parseCustomInches(customLength)
    : null;
  const selectedCustomWidth = isCustomGroup
    ? parseCustomInches(customWidth)
    : null;
  const cartLine = findLine(
    product.id,
    variant.id,
    selectedCustomLength,
    selectedCustomWidth,
    selectedAddonIds,
  );

  function selectSizeGroup(groupId: string) {
    const groupVariants = variants.filter((v) => v.sizeGroupOptionId === groupId);
    const custom = groupVariants[0]?.isCustomSize ?? false;
    const nextDim = custom
      ? null
      : (groupVariants.find((v) => v.sizeDimensionId)?.sizeDimensionId ?? null);
    const thickPool = groupVariants.filter(
      (v) =>
        custom || (v.sizeDimensionId ?? null) === (nextDim ?? null),
    );
    const nextThick =
      (axis.thicknessOptionId &&
        thickPool.some((v) => v.thicknessOptionId === axis.thicknessOptionId)
        ? axis.thicknessOptionId
        : thickPool.find((v) => v.thicknessOptionId)?.thicknessOptionId) ?? null;

    setAxis({
      sizeGroupOptionId: groupId,
      sizeDimensionId: nextDim,
      thicknessOptionId: nextThick,
      colourId: axis.colourId,
    });
    if (!custom) {
      setCustomLength("");
      setCustomWidth("");
    }
  }

  function selectDimension(dimId: string) {
    const pool = variants.filter(
      (v) =>
        v.sizeGroupOptionId === axis.sizeGroupOptionId &&
        v.sizeDimensionId === dimId,
    );
    const nextThick =
      (axis.thicknessOptionId &&
        pool.some((v) => v.thicknessOptionId === axis.thicknessOptionId)
        ? axis.thicknessOptionId
        : pool.find((v) => v.thicknessOptionId)?.thicknessOptionId) ?? null;

    setAxis({
      ...axis,
      sizeDimensionId: dimId,
      thicknessOptionId: nextThick,
    });
  }

  function selectThickness(thickId: string) {
    setAxis({ ...axis, thicknessOptionId: thickId });
  }

  function selectColour(colourId: string) {
    // Colour only — size / dimension / thickness stay put.
    setAxis({ ...axis, colourId });
  }

  function handleAddToCart() {
    let customLengthIn: number | null = null;
    let customWidthIn: number | null = null;

    if (isCustomGroup) {
      customLengthIn = parseCustomInches(customLength);
      customWidthIn = parseCustomInches(customWidth);
      if (!customLengthIn || !customWidthIn) {
        toast.error("Enter custom length and width in inches.");
        return;
      }
    }

    startTransition(async () => {
      const result = await addItem({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
        customLengthIn,
        customWidthIn,
        addonIds: selectedAddonIds,
      });
      if (!result.ok) {
        toast.error(result.error ?? "Could not add to cart");
        return;
      }
      toast.success("Added to cart");
    });
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  if (!initial) {
    return (
      <p className="text-muted-foreground">
        This product has no active variants yet.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <PdpGallery
          images={galleryImages}
          videos={variant.videos}
          alt={product.name}
        />
      </div>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-heading text-2xl leading-tight md:text-3xl">
              {product.name}
            </h1>
            {product.bedRangeName ? (
              <Badge variant="secondary" className="font-normal">
                {product.bedRangeName}
              </Badge>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0 rounded-full"
            aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
            onClick={() => toggle(product.id)}
          >
            <Heart className={cn("size-5", liked && "fill-destructive text-destructive")} />
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold text-brass">
              {formatINR(displayPrice)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {formatINR(displayMrp)}
            </span>
            {off > 0 && (
              <Badge className="bg-brass/15 text-ink hover:bg-brass/15">
                {off}% off
              </Badge>
            )}
          </div>
          {addonExtra > 0 ? (
            <p className="text-xs text-muted-foreground">
              Includes {formatINR(addonExtra)} in selected add-ons
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Max discount capped at {variant.maxDiscountPercent}% on this variant
            (showroom policy).
          </p>
          <Badge variant="outline" className="mt-1 uppercase tracking-wide">
            {stockLabel(variant.stockStatus, variant.stockQty, variant.madeToOrderDays)}
          </Badge>
        </div>

        <div className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-border/60">
          {sizeGroups.length > 0 && (
            <div className="space-y-2">
              <Label>Available sizes</Label>
              <div className="flex flex-wrap gap-2">
                {sizeGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={chipClass(axis.sizeGroupOptionId === g.id)}
                    onClick={() => selectSizeGroup(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isCustomGroup && dimensions.length > 0 && (
            <div className="space-y-2">
              <Label>Dimension</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {dimensions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={chipClass(axis.sizeDimensionId === d.id)}
                    onClick={() => selectDimension(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCustomGroup && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Custom size — enter length and width in inches.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-length">Length (in)</Label>
                  <Input
                    id="custom-length"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="e.g. 78"
                    value={customLength}
                    onChange={(e) => setCustomLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-width">Width (in)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="e.g. 60"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {hasThickness && (
            <div className="space-y-2">
              <Label>Thickness</Label>
              <div className="flex flex-wrap gap-2">
                {thicknesses.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={chipClass(axis.thicknessOptionId === t.id)}
                    onClick={() => selectThickness(t.id)}
                  >
                    {t.label.replace(/ inch/i, "")}
                  </button>
                ))}
              </div>
              {variant.thicknessLabel && (
                <p className="text-xs text-muted-foreground">
                  ({variant.thicknessLabel})
                </p>
              )}
            </div>
          )}

          {swatches.length > 0 && (
            <div className="space-y-2">
              <Label>Available colors</Label>
              <div className="flex flex-wrap gap-2">
                {swatches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => selectColour(c.id)}
                    className={cn(
                      "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background",
                      axis.colourId === c.id ? "ring-brass" : "ring-transparent",
                    )}
                    style={{
                      backgroundColor:
                        colours.find((x) => x.id === c.id)?.hex ?? c.hex,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {colours.find((c) => c.id === axis.colourId)?.name ??
                  variant.colourName}
              </p>
            </div>
          )}

          {isBed ? (
            <PdpBedAddons
              addons={bedAddons}
              selectedIds={selectedAddonIds}
              onToggle={toggleAddon}
            />
          ) : null}

          <p className="text-xs text-muted-foreground">SKU {variant.sku}</p>

          {cartLine ? (
            <CartQuantityControls
              cartId={cartLine.id}
              quantity={cartLine.quantity}
              className="justify-between"
            />
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={pending}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-4" />
              {pending ? "Adding…" : "Add to cart"}
            </Button>
          )}
        </div>

        <PdpDetails product={product} />
      </div>
    </div>
  );
}

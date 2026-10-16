"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colours, sizes } from "@/data/mock";
import { useShortlist } from "@/hooks/use-shortlist";
import { discountPercent, formatINR, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productColours } from "@/services/catalogue";
import type { Product, Variant } from "@/types";
import { PdpDetails } from "./pdp-details";
import { PdpGallery } from "./pdp-gallery";

function pickVariant(
  product: Product,
  colourId: string,
  sizeId: string | undefined,
  configuration: string | undefined,
): Variant {
  return (
    product.variants.find(
      (v) =>
        v.colourId === colourId &&
        (!sizeId || v.sizeId === sizeId) &&
        (!configuration || v.configuration === configuration),
    ) ??
    product.variants.find((v) => v.colourId === colourId) ??
    product.variants[0]
  );
}

function optionsForColour(product: Product, colourId: string) {
  const colourVariants = product.variants.filter((v) => v.colourId === colourId);
  const sizeIds = [
    ...new Set(colourVariants.map((v) => v.sizeId).filter(Boolean)),
  ] as string[];
  const configs = [
    ...new Set(colourVariants.map((v) => v.configuration).filter(Boolean)),
  ] as string[];
  return {
    sizeItems: sizeIds.map((id) => {
      const s = sizes.find((x) => x.id === id);
      return { value: id, label: s ? `${s.group} · ${s.label}` : id };
    }),
    configItems: configs.map((cfg) => ({
      value: cfg,
      label: cfg.replace(/_/g, " "),
    })),
  };
}

export function PdpMain({ product }: { product: Product }) {
  const swatches = productColours(product);
  const initial = product.variants[0];
  const [colourId, setColourId] = useState(initial.colourId);
  const [sizeId, setSizeId] = useState<string | undefined>(initial.sizeId);
  const [configuration, setConfiguration] = useState<string | undefined>(
    initial.configuration,
  );
  const { has, toggle } = useShortlist();
  const liked = has(product.id);

  const { sizeItems, configItems } = optionsForColour(product, colourId);
  const variant = pickVariant(product, colourId, sizeId, configuration);
  const off = discountPercent(variant.mrp, variant.price);

  function selectColour(nextColour: string) {
    setColourId(nextColour);
    const next = optionsForColour(product, nextColour);
    const nextSizeIds = next.sizeItems.map((s) => s.value);
    const nextConfigs = next.configItems.map((c) => c.value);
    setSizeId((prev) =>
      prev && nextSizeIds.includes(prev) ? prev : nextSizeIds[0],
    );
    setConfiguration((prev) =>
      prev && nextConfigs.includes(prev) ? prev : nextConfigs[0],
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <PdpGallery images={variant.images} videos={variant.videos} alt={product.name} />
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-2xl leading-tight md:text-3xl">
            {product.name}
          </h1>
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
              {formatINR(variant.price)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {formatINR(variant.mrp)}
            </span>
            {off > 0 && (
              <Badge className="bg-brass/15 text-ink hover:bg-brass/15">
                {off}% off
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Max discount capped at {variant.maxDiscountPercent}% on this variant
            (showroom policy).
          </p>
          <Badge variant="outline" className="mt-1 uppercase tracking-wide">
            {stockLabel(variant.stockStatus, variant.stockQty, variant.madeToOrderDays)}
          </Badge>
        </div>

        <div className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border/60">
          <div className="space-y-2">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {swatches.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.name}
                  onClick={() => selectColour(c.id)}
                  className={cn(
                    "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background",
                    colourId === c.id ? "ring-brass" : "ring-transparent",
                  )}
                  style={{
                    backgroundColor:
                      colours.find((x) => x.id === c.id)?.hex ?? c.hex,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {colours.find((c) => c.id === colourId)?.name}
            </p>
          </div>

          {sizeItems.length > 0 && (
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                items={sizeItems}
                value={sizeId ?? null}
                onValueChange={(v) => {
                  if (typeof v === "string") setSizeId(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeItems.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {configItems.length > 0 && (
            <div className="space-y-2">
              <Label>Configuration</Label>
              <Select
                items={configItems}
                value={configuration ?? null}
                onValueChange={(v) => {
                  if (typeof v === "string") setConfiguration(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configItems.map((cfg) => (
                    <SelectItem key={cfg.value} value={cfg.value}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <p className="text-xs text-muted-foreground">SKU {variant.sku}</p>
        </div>

        <PdpDetails product={product} />
      </div>
    </div>
  );
}

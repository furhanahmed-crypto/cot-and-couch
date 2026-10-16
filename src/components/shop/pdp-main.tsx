"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { colours, sizes } from "@/data/mock";
import { useShortlist } from "@/hooks/use-shortlist";
import { discountPercent, formatINR, inchesToCm, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productColours } from "@/services/catalogue";
import type { Product, Variant } from "@/types";
import { PdpGallery } from "./pdp-gallery";

function assemblyCopy(mode: Product["assembly"]) {
  if (mode === "pre_assembled") return "Delivered pre-assembled where possible.";
  if (mode === "carpenter") return "Carpenter assembly included within Hyderabad.";
  return "No assembly required.";
}

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

export function PdpMain({ product }: { product: Product }) {
  const swatches = useMemo(() => productColours(product), [product]);
  const initial = product.variants[0];
  const [colourId, setColourId] = useState(initial.colourId);
  const [sizeId, setSizeId] = useState<string | undefined>(initial.sizeId);
  const [configuration, setConfiguration] = useState<string | undefined>(
    initial.configuration,
  );

  const colourVariants = useMemo(
    () => product.variants.filter((v) => v.colourId === colourId),
    [product, colourId],
  );

  const sizeItems = useMemo(() => {
    const ids = [...new Set(colourVariants.map((v) => v.sizeId).filter(Boolean))] as string[];
    return ids.map((id) => {
      const s = sizes.find((x) => x.id === id);
      return { value: id, label: s ? `${s.group} · ${s.label}` : id };
    });
  }, [colourVariants]);

  const configItems = useMemo(() => {
    const cfgs = [
      ...new Set(colourVariants.map((v) => v.configuration).filter(Boolean)),
    ] as string[];
    return cfgs.map((cfg) => ({
      value: cfg,
      label: cfg.replace(/_/g, " "),
    }));
  }, [colourVariants]);

  function selectColour(nextColour: string) {
    setColourId(nextColour);
    const next = product.variants.filter((v) => v.colourId === nextColour);
    const nextSizes = [...new Set(next.map((v) => v.sizeId).filter(Boolean))] as string[];
    const nextConfigs = [
      ...new Set(next.map((v) => v.configuration).filter(Boolean)),
    ] as string[];
    setSizeId((prev) =>
      prev && nextSizes.includes(prev) ? prev : nextSizes[0],
    );
    setConfiguration((prev) =>
      prev && nextConfigs.includes(prev) ? prev : nextConfigs[0],
    );
  }

  const variant = pickVariant(product, colourId, sizeId, configuration);
  const off = discountPercent(variant.mrp, variant.price);
  const { has, toggle } = useShortlist();
  const liked = has(product.id);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <PdpGallery images={variant.images} videos={variant.videos} alt={product.name} />
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-2xl leading-tight md:text-3xl">{product.name}</h1>
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
            <span className="text-2xl font-semibold text-brass">{formatINR(variant.price)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatINR(variant.mrp)}</span>
            {off > 0 && <Badge className="bg-brass/15 text-ink hover:bg-brass/15">{off}% off</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            Max discount capped at {variant.maxDiscountPercent}% on this variant (showroom policy).
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
                  style={{ backgroundColor: colours.find((x) => x.id === c.id)?.hex ?? c.hex }}
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

        <ul className="list-inside list-disc space-y-1 text-sm">
          {product.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Specification</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(product.specs).map(([key, val]) => (
              <TableRow key={key}>
                <TableCell className="capitalize">{key.replace(/([A-Z])/g, " $1")}</TableCell>
                <TableCell>{String(val)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>Overall dimensions</TableCell>
              <TableCell>
                {product.dimensions.lIn}&quot; × {product.dimensions.wIn}&quot; × {product.dimensions.hIn}&quot;
                {" · "}
                {inchesToCm(product.dimensions.lIn)} × {inchesToCm(product.dimensions.wIn)} cm
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Accordion multiple className="rounded-xl ring-1 ring-border/60">
          <AccordionItem value="warranty">
            <AccordionTrigger>Warranty</AccordionTrigger>
            <AccordionContent>
              {product.warrantyYears}-year warranty. Exclusions: {product.warrantyExclusions}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger>Care</AccordionTrigger>
            <AccordionContent>{product.care}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="assembly">
            <AccordionTrigger>Assembly</AccordionTrigger>
            <AccordionContent>{assemblyCopy(product.assembly)}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery">
            <AccordionTrigger>Delivery</AccordionTrigger>
            <AccordionContent>{product.deliveryDays}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <p className="text-xs text-muted-foreground">
          Material: {product.material} · Finish: {product.finish}
        </p>
        <Link href="/catalogue" className="text-sm text-brass underline-offset-2 hover:underline">
          ← Back to catalogue
        </Link>
      </div>
    </div>
  );
}

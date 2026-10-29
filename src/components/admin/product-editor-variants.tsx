"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  setVariantPriceAction,
  setVariantStockAction,
} from "@/app/admin/catalogue/actions";
import { generateProductVariantsAction } from "@/app/admin/catalogue/product-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { discountPercent, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Variant } from "@/types";

/** HTML product-editor style: size × thickness chips + compact editable grid. */
export function ProductEditorVariants({
  productId,
  variants: initial,
  noColour,
  categorySlug,
}: {
  productId: string;
  variants: Variant[];
  /** Mattresses: hide colour axis (HTML / category template). */
  noColour?: boolean;
  categorySlug?: string;
}) {
  const router = useRouter();
  const [variants, setVariants] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const sizeChips = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const v of variants) {
      const key = v.sizeDimensionId ?? `custom:${v.sizeGroupOptionId}`;
      const label = v.isCustomSize
        ? "Custom"
        : [v.sizeGroupLabel, v.sizeDimensionLabel].filter(Boolean).join(" ");
      const prev = map.get(key);
      map.set(key, {
        key,
        label: label || "Size",
        count: (prev?.count ?? 0) + 1,
      });
    }
    return [...map.values()];
  }, [variants]);

  const thicknessChips = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const v of variants) {
      if (!v.thicknessOptionId || !v.thicknessLabel) continue;
      const prev = map.get(v.thicknessOptionId);
      map.set(v.thicknessOptionId, {
        key: v.thicknessOptionId,
        label: v.thicknessLabel.replace(/inch/i, "in").trim(),
        count: (prev?.count ?? 0) + 1,
      });
    }
    return [...map.values()];
  }, [variants]);

  const colourChips = useMemo(() => {
    if (noColour) return [];
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const v of variants) {
      if (!v.colourId || !v.colourName) continue;
      const prev = map.get(v.colourId);
      map.set(v.colourId, {
        key: v.colourId,
        label: v.colourName,
        count: (prev?.count ?? 0) + 1,
      });
    }
    return [...map.values()];
  }, [variants, noColour]);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (sizeChips.length) parts.push(`${sizeChips.length} sizes`);
    if (thicknessChips.length) {
      parts.push(`${thicknessChips.length} thicknesses`);
    }
    if (colourChips.length) parts.push(`${colourChips.length} colours`);
    const combo = parts.join(" × ");
    const note = noColour ? " · no colour option for mattresses" : "";
    return `${combo} = ${variants.length} variants${note}`;
  }, [sizeChips, thicknessChips, colourChips, variants.length, noColour]);

  function patchLocal(
    variantId: string,
    patch: Partial<Pick<Variant, "mrp" | "price" | "stockQty">>,
  ) {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, ...patch } : v)),
    );
  }

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(on: boolean) {
    setSelected(on ? new Set(variants.map((v) => v.id)) : new Set());
  }

  function savePrice(v: Variant, mrp: number, price: number) {
    if (mrp === v.mrp && price === v.price) return;
    patchLocal(v.id, { mrp, price });
    startTransition(async () => {
      const res = await setVariantPriceAction({
        variantId: v.id,
        productId,
        mrp: String(mrp),
        price: String(price),
      });
      if (!res.ok) {
        toast.error("Could not save price");
        patchLocal(v.id, { mrp: v.mrp, price: v.price });
        return;
      }
      toast.success("Price updated");
    });
  }

  function saveStock(v: Variant, stockQty: number) {
    const qty = Math.max(0, Math.floor(stockQty));
    if (qty === v.stockQty) return;
    patchLocal(v.id, { stockQty: qty });
    startTransition(async () => {
      const res = await setVariantStockAction({
        variantId: v.id,
        productId,
        stockQty: qty,
      });
      if (!res.ok) {
        toast.error("Could not save stock");
        patchLocal(v.id, { stockQty: v.stockQty });
        return;
      }
      toast.success("Stock updated");
    });
  }

  function bulk(kind: "mrp" | "price" | "stock") {
    if (!selected.size) {
      toast.message("Select variants first");
      return;
    }
    const raw = window.prompt(
      kind === "stock" ? "Set stock qty for selected" : `Set ${kind} for selected`,
    );
    if (raw == null || raw.trim() === "") return;
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      toast.error("Enter a valid number");
      return;
    }
    const ids = [...selected];
    startTransition(async () => {
      for (const id of ids) {
        const v = variants.find((x) => x.id === id);
        if (!v) continue;
        if (kind === "stock") {
          await setVariantStockAction({ variantId: id, productId, stockQty: Math.floor(num) });
          patchLocal(id, { stockQty: Math.floor(num) });
        } else if (kind === "mrp") {
          await setVariantPriceAction({
            variantId: id,
            productId,
            mrp: String(num),
            price: String(v.price),
          });
          patchLocal(id, { mrp: num });
        } else {
          await setVariantPriceAction({
            variantId: id,
            productId,
            mrp: String(v.mrp),
            price: String(num),
          });
          patchLocal(id, { price: num });
        }
      }
      toast.success(`Updated ${ids.length} variants`);
    });
  }

  function generate() {
    startTransition(async () => {
      const res = await generateProductVariantsAction(productId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Created ${res.count} variants`);
      router.refresh();
    });
  }

  if (!variants.length) {
    const hint =
      categorySlug === "mattresses"
        ? "Creates size (L×W) × thickness SKUs from masters (6 in · 8 in)."
        : categorySlug === "cots"
          ? "Creates width SKUs (× colour if colours exist) from Categories → Cots."
          : "Creates colour SKUs on custom size from masters.";
    return (
      <section className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-heading text-lg">Variants & pricing</h2>
        <p className="text-sm text-muted-foreground">
          No variants yet for this product.
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <Button type="button" disabled={pending} onClick={generate}>
          {pending ? "Generating…" : "Generate variants from masters"}
        </Button>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-heading text-lg">Variants & pricing</h2>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      <div className="space-y-3">
        <ChipRow label="Size (L × W)" chips={sizeChips} />
        {thicknessChips.length > 0 && (
          <ChipRow label="Thickness" chips={thicknessChips} />
        )}
        {colourChips.length > 0 && (
          <ChipRow label="Colour / finish" chips={colourChips} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Bulk edit selected ({selected.size}):
        </span>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => bulk("mrp")}>
          Set MRP
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => bulk("price")}>
          Set offer price
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => bulk("stock")}>
          Set stock
        </Button>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === variants.length && variants.length > 0}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all variants"
                />
              </TableHead>
              <TableHead>Variant</TableHead>
              <TableHead className="w-28">MRP</TableHead>
              <TableHead className="w-28">Offer price</TableHead>
              <TableHead className="w-16">Off</TableHead>
              <TableHead className="w-24">Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                noColour={noColour}
                checked={selected.has(v.id)}
                disabled={pending}
                onCheckedChange={(on) => toggle(v.id, on)}
                onSavePrice={(mrp, price) => savePrice(v, mrp, price)}
                onSaveStock={(qty) => saveStock(v, qty)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function ChipRow({
  label,
  chips,
}: {
  label: string;
  chips: { key: string; label: string; count: number }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c.key}
            className={cn(
              "inline-flex items-center rounded-full border border-border bg-secondary/80 px-3 py-1 text-sm text-secondary-foreground",
            )}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function VariantRow({
  variant: v,
  noColour,
  checked,
  disabled,
  onCheckedChange,
  onSavePrice,
  onSaveStock,
}: {
  variant: Variant;
  noColour?: boolean;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (on: boolean) => void;
  onSavePrice: (mrp: number, price: number) => void;
  onSaveStock: (qty: number) => void;
}) {
  const [mrp, setMrp] = useState(String(v.mrp));
  const [price, setPrice] = useState(String(v.price));
  const [qty, setQty] = useState(String(v.stockQty));
  const off = discountPercent(Number(mrp) || v.mrp, Number(price) || v.price);

  const title = [
    v.isCustomSize
      ? "Custom"
      : [v.sizeGroupLabel, v.sizeDimensionLabel].filter(Boolean).join(" "),
    v.thicknessLabel?.replace(/inch/i, "in"),
    !noColour ? v.colourName : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(Boolean(val))}
          aria-label={`Select ${v.sku}`}
        />
      </TableCell>
      <TableCell>
        <div className="font-medium">{title || "—"}</div>
        <div className="font-mono text-xs text-muted-foreground">{v.sku}</div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          className="w-28"
          disabled={disabled}
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
          onBlur={() => onSavePrice(Number(mrp) || 0, Number(price) || 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          className="w-28"
          disabled={disabled}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => onSavePrice(Number(mrp) || 0, Number(price) || 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      </TableCell>
      <TableCell>
        {off > 0 ? (
          <Badge className="bg-brass/15 text-ink hover:bg-brass/15">{off}%</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          className="w-24"
          disabled={disabled}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={() => onSaveStock(Number(qty) || 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {v.stockStatus.replaceAll("_", " ")}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

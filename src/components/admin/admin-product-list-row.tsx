"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  archiveProductAction,
  deleteProductAction,
} from "@/app/admin/catalogue/product-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product, ProductStatus } from "@/types";
import {
  optionsSummary,
  productSkuPrefix,
  specCompleteness,
  stockSummary,
} from "@/components/admin/admin-products-helpers";

function statusTone(status: ProductStatus) {
  if (status === "published")
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  if (status === "draft") return "bg-muted text-muted-foreground";
  return "bg-amber-500/15 text-amber-900 dark:text-amber-300";
}

function stockTone(kind: ReturnType<typeof stockSummary>["kind"]) {
  if (kind === "in_stock")
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  if (kind === "made_to_order")
    return "bg-sky-500/15 text-sky-800 dark:text-sky-300";
  if (kind === "low")
    return "bg-amber-500/15 text-amber-900 dark:text-amber-300";
  return "bg-destructive/15 text-destructive";
}

function specBarTone(filled: number, total: number) {
  const pct = filled / total;
  if (pct >= 1) return "bg-emerald-600";
  if (pct >= 0.6) return "bg-amber-500";
  return "bg-destructive";
}

export function AdminProductListRow({
  product,
  categoryName,
  collectionName,
  selected,
  onSelect,
}: {
  product: Product;
  categoryName: string;
  collectionName?: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const thumb = product.variants.find((v) => v.images[0])?.images[0];
  const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : NaN;
  const maxPrice = prices.length ? Math.max(...prices) : NaN;
  const priceLabel =
    !Number.isFinite(minPrice)
      ? "—"
      : minPrice === maxPrice
        ? formatINR(minPrice)
        : `${formatINR(minPrice)} – ${formatINR(maxPrice)}`;

  const stock = stockSummary(product);
  const specs = specCompleteness(product);
  const options = optionsSummary(product);
  const sku = productSkuPrefix(product);
  const sub =
    product.highlights[0] ||
    (typeof product.specs.purpose === "string" ? product.specs.purpose : null);

  function archive() {
    startTransition(async () => {
      await archiveProductAction(product.id);
      router.refresh();
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      await deleteProductAction(product.id);
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <TableRow data-selected={selected || undefined}>
        <TableCell className="w-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelect(v === true)}
            aria-label={`Select ${product.name}`}
          />
        </TableCell>
        <TableCell className="min-w-[260px] max-w-[320px] whitespace-normal">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
              {thumb ? (
                <Image src={thumb} alt="" fill className="object-cover" sizes="44px" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={ROUTES.admin.productEdit(product.id)}
                  className="truncate font-medium hover:underline"
                >
                  {product.name}
                </Link>
                {collectionName ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/15 font-normal text-amber-900 dark:text-amber-200"
                  >
                    {collectionName}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {categoryName}
                {sub ? ` · ${sub}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {sku ? `${sku} · ` : ""}
                {product.variants.length} variant
                {product.variants.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="max-w-[180px] text-sm whitespace-normal text-muted-foreground">
          {options || "—"}
        </TableCell>
        <TableCell className="whitespace-nowrap font-medium">{priceLabel}</TableCell>
        <TableCell className="whitespace-nowrap">
          <Badge
            variant="secondary"
            className={cn("font-normal", stockTone(stock.kind))}
          >
            {stock.label}
          </Badge>
        </TableCell>
        <TableCell className="min-w-[110px]">
          <p className="text-xs text-muted-foreground">
            {specs.filled}/{specs.total} fields
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", specBarTone(specs.filled, specs.total))}
              style={{ width: `${Math.round((specs.filled / specs.total) * 100)}%` }}
            />
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          <Badge
            variant="secondary"
            className={cn("capitalize font-normal", statusTone(product.status))}
          >
            {product.status === "archived" ? "Archived" : product.status}
          </Badge>
        </TableCell>
        <TableCell className="sticky right-0 bg-card text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted",
              )}
              aria-label="Row actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.admin.productEdit(product.id))}
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={pending || product.status === "archived"}
                onClick={archive}
              >
                <Archive className="size-3.5" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={pending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete product?"
        description={`${product.name} and its variants will be permanently removed.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}

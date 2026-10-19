"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react";
import { AdminProductListRow } from "@/components/admin/admin-product-list-row";
import { AdminProductsCreate } from "@/components/admin/admin-products-create";
import {
  specCompleteness,
  stockSummary,
} from "@/components/admin/admin-products-helpers";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Category, Collection, Product } from "@/types";

const PAGE_SIZE = 8;

type StatusFilter = "all" | "published" | "draft" | "archived";
type StockFilter = "all" | "in_stock" | "low" | "made_to_order" | "out";
type SpecFilter = "all" | "complete" | "incomplete";
type SortKey = "updated" | "name" | "price" | "stock";

export function AdminProductsTable({
  products,
  categories,
  collections,
}: {
  products: Product[];
  categories: Category[];
  collections: Collection[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [collectionId, setCollectionId] = useState<string>("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [specs, setSpecs] = useState<SpecFilter>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importHint, setImportHint] = useState(false);

  const byCat = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const byCol = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const liveCategories = categories.filter((c) => c.visible).length;
  const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (status !== "all" && p.status !== status) return false;
      if (collectionId !== "all" && p.collectionId !== collectionId) return false;

      if (stock !== "all") {
        const s = stockSummary(p);
        if (stock === "in_stock" && s.kind !== "in_stock") return false;
        if (stock === "low" && s.kind !== "low") return false;
        if (stock === "made_to_order" && s.kind !== "made_to_order") return false;
        if (stock === "out" && s.kind !== "out") return false;
      }

      if (specs !== "all") {
        const sc = specCompleteness(p);
        const complete = sc.filled >= sc.total;
        if (specs === "complete" && !complete) return false;
        if (specs === "incomplete" && complete) return false;
      }

      if (!q) return true;
      const cat = byCat.get(p.categoryId)?.name ?? "";
      const col = p.collectionId ? byCol.get(p.collectionId)?.name ?? "" : "";
      const skus = p.variants.map((v) => v.sku).join(" ");
      return (
        p.name.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        col.toLowerCase().includes(q) ||
        skus.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") {
        const pa = Math.min(...a.variants.map((v) => v.price), Infinity);
        const pb = Math.min(...b.variants.map((v) => v.price), Infinity);
        return (Number.isFinite(pa) ? pa : 0) - (Number.isFinite(pb) ? pb : 0);
      }
      if (sort === "stock") {
        return stockSummary(b).qty - stockSummary(a).qty;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [
    products,
    query,
    categoryId,
    status,
    collectionId,
    stock,
    specs,
    sort,
    byCat,
    byCol,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));

  function toggleAllOnPage(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of pageRows) {
        if (checked) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  }

  function exportCsv() {
    const header = [
      "id",
      "name",
      "category",
      "collection",
      "status",
      "variants",
      "min_price",
      "max_price",
      "stock_qty",
      "spec_filled",
      "spec_total",
    ];
    const lines = filtered.map((p) => {
      const prices = p.variants.map((v) => v.price).filter((x) => x > 0);
      const sc = specCompleteness(p);
      const cells = [
        p.id,
        p.name,
        byCat.get(p.categoryId)?.name ?? "",
        p.collectionId ? byCol.get(p.collectionId)?.name ?? "" : "",
        p.status,
        String(p.variants.length),
        prices.length ? String(Math.min(...prices)) : "",
        prices.length ? String(Math.max(...prices)) : "",
        String(stockSummary(p).qty),
        String(sc.filled),
        String(sc.total),
      ];
      return cells.map(csvEscape).join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cot-couch-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  const pageNumbers = paginationWindow(safePage, pageCount);

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            <Link href={ROUTES.admin.categories} className="hover:underline">
              Catalogue
            </Link>
            {" / "}
            <span className="text-foreground">Products</span>
          </p>
          <h1 className="mt-1 font-heading text-2xl tracking-tight text-ink md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} products · {totalVariants.toLocaleString("en-IN")}{" "}
            variants across {liveCategories} live categor
            {liveCategories === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImportHint(true)}
          >
            <Upload className="size-3.5" />
            Import CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-3.5" />
            Export
          </Button>
          <AdminProductsCreate categories={categories} />
        </div>
      </div>

      {importHint ? (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          CSV import is not wired yet — use{" "}
          <span className="font-medium text-foreground">Add product</span> for
          drafts.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setImportHint(false)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex min-w-0 items-center gap-1 overflow-x-auto border-b border-border pb-px">
        <CategoryTab
          active={categoryId === "all"}
          onClick={() => {
            setCategoryId("all");
            setPage(1);
          }}
          label={`All (${products.length})`}
        />
        {categories.map((c) => (
          <CategoryTab
            key={c.id}
            active={categoryId === c.id}
            onClick={() => {
              setCategoryId(c.id);
              setPage(1);
            }}
            label={`${c.name} (${categoryCounts.get(c.id) ?? 0})`}
          />
        ))}
        <Link
          href={ROUTES.admin.categories}
          className="ml-1 shrink-0 px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          + New category
        </Link>
      </div>

      <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 pb-0.5">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, SKU, collection…"
          className="h-9 w-56 shrink-0 sm:w-64"
        />
        <AppSelect
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter);
            setPage(1);
          }}
          triggerClassName="h-9 w-[8.75rem] shrink-0"
          items={[
            { value: "all", label: "Status: All" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
        />
        <AppSelect
          value={collectionId}
          onValueChange={(v) => {
            setCollectionId(v);
            setPage(1);
          }}
          triggerClassName="h-9 w-[9.5rem] shrink-0"
          items={[
            { value: "all", label: "Collection" },
            ...collections.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <AppSelect
          value={stock}
          onValueChange={(v) => {
            setStock(v as StockFilter);
            setPage(1);
          }}
          triggerClassName="h-9 w-[8.5rem] shrink-0"
          items={[
            { value: "all", label: "Stock" },
            { value: "in_stock", label: "In stock" },
            { value: "low", label: "Low stock" },
            { value: "made_to_order", label: "Made to order" },
            { value: "out", label: "Out of stock" },
          ]}
        />
        <AppSelect
          value={specs}
          onValueChange={(v) => {
            setSpecs(v as SpecFilter);
            setPage(1);
          }}
          triggerClassName="h-9 w-[10.5rem] shrink-0"
          items={[
            { value: "all", label: "Spec completeness" },
            { value: "complete", label: "Complete" },
            { value: "incomplete", label: "Incomplete" },
          ]}
        />
        <AppSelect
          value={sort}
          onValueChange={(v) => setSort(v as SortKey)}
          triggerClassName="ml-auto h-9 w-[10.75rem] shrink-0"
          items={[
            { value: "updated", label: "Sort: Last updated" },
            { value: "name", label: "Sort: Name" },
            { value: "price", label: "Sort: Price" },
            { value: "stock", label: "Sort: Stock" },
          ]}
        />
      </div>

      <div className="min-w-0 rounded-xl border border-border bg-card">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(v) => toggleAllOnPage(v === true)}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead className="min-w-[220px]">Product</TableHead>
              <TableHead>Options</TableHead>
              <TableHead className="whitespace-nowrap">Price</TableHead>
              <TableHead className="whitespace-nowrap">Stock</TableHead>
              <TableHead className="whitespace-nowrap">Specs</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="sticky right-0 bg-card w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((p) => (
              <AdminProductListRow
                key={p.id}
                product={p}
                categoryName={byCat.get(p.categoryId)?.name ?? "—"}
                collectionName={
                  p.collectionId ? byCol.get(p.collectionId)?.name : undefined
                }
                selected={selected.has(p.id)}
                onSelect={(checked) => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(p.id);
                    else next.delete(p.id);
                    return next;
                  });
                }}
              />
            ))}
          </TableBody>
        </Table>
        {pageRows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No products match these filters.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {from}–{to} of {filtered.length} products
          {selected.size > 0 ? ` · ${selected.size} selected` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pageNumbers.map((n, i) =>
            n === "…" ? (
              <span key={`e-${i}`} className="px-1 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={n}
                type="button"
                size="icon-sm"
                variant={n === safePage ? "default" : "outline"}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={safePage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function paginationWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push("…");
    out.push(sorted[i]!);
  }
  return out;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

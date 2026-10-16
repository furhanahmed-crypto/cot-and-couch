"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Plus, Trash2 } from "lucide-react";
import {
  archiveProductAction,
  createProductAction,
  deleteProductAction,
} from "@/app/admin/catalogue/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category, Product, ProductStatus } from "@/types";

function statusVariant(status: ProductStatus) {
  if (status === "published") return "default";
  if (status === "draft") return "secondary";
  return "outline";
}

export function AdminProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(products);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  function archive(id: string) {
    setRows((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "archived" as const } : p,
      ),
    );
    startTransition(async () => {
      await archiveProductAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await createProductAction({
              categoryId,
              name,
              slug,
            });
            if (!res.ok) setError(res.error);
            else {
              setName("");
              setSlug("");
              router.refresh();
            }
          });
        }}
      >
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              );
            }}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> Add draft
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(p.status)}
                    className="capitalize"
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>{p.variants.length}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || p.status === "archived"}
                      onClick={() => archive(p.id)}
                    >
                      <Archive className="size-3.5" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await deleteProductAction(p.id);
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

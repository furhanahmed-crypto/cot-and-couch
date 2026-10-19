"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductAction } from "@/app/admin/catalogue/product-actions";
import { ProductEditorMedia } from "@/components/admin/product-editor-media";
import { ProductEditorTemplate } from "@/components/admin/product-editor-template";
import { ProductEditorVariants } from "@/components/admin/product-editor-variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { templateForCategorySlug } from "@/constants/admin-product-templates";
import { ROUTES } from "@/constants/routes";
import type { Category, Product, ProductStatus } from "@/types";

export function ProductEditorForm({
  product,
  category,
}: {
  product: Product;
  category: Category | undefined;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const template = templateForCategorySlug(category?.slug ?? "");
  const images = product.variants.flatMap((v) => v.images).slice(0, 6);

  function save() {
    startTransition(async () => {
      const res = await updateProductAction({
        productId: product.id,
        name,
        description,
        status,
        isFeatured: product.featured,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Product saved");
      router.refresh();
    });
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.admin.products)}>
          Back to products
        </Button>
        <Button type="button" disabled={pending} onClick={save} className="sm:ml-auto">
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="min-w-0 space-y-4">
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-lg">Identity</h2>
            <div className="space-y-1">
              <Label htmlFor="pe-name">Product name</Label>
              <Input id="pe-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={category?.name ?? "—"} disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pe-desc">Description</Label>
              <Textarea
                id="pe-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pe-status">Status</Label>
              <select
                id="pe-status"
                className="h-9 w-full max-w-full rounded-lg border border-input bg-background px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </section>
          <ProductEditorTemplate template={template} />
          <ProductEditorVariants
            productId={product.id}
            variants={product.variants}
            noColour={category?.slug === "mattresses"}
          />
        </div>
        <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
          <ProductEditorMedia imageUrls={images} note={template?.note} />
        </div>
      </div>
    </div>
  );
}

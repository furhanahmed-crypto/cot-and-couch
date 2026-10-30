"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProductAction } from "@/app/admin/catalogue/product-actions";
import { ProductEditorColors } from "@/components/admin/product-editor-colors";
import {
  ProductEditorTemplate,
  type MattressSpecState,
} from "@/components/admin/product-editor-template";
import { ProductEditorMedia } from "@/components/admin/product-editor-media";
import { ProductEditorVariants } from "@/components/admin/product-editor-variants";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { templateForCategorySlug } from "@/constants/admin-product-templates";
import { ROUTES } from "@/constants/routes";
import type {
  Category,
  Product,
  ProductEditorLookups,
  ProductStatus,
} from "@/types";

export function ProductEditorForm({
  product,
  category,
  lookups,
}: {
  product: Product;
  category: Category | undefined;
  lookups: ProductEditorLookups;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [attributes, setAttributes] = useState<Record<string, string>>(
    product.attributes ?? {},
  );
  const [mattress, setMattress] = useState<MattressSpecState>({
    mattressBrandId: product.mattressBrandId ?? "",
    purposeOptionId: product.purposeOptionId ?? "",
    comfortOptionId: product.comfortOptionId ?? "",
    fillingOptionId: product.fillingOptionId ?? "",
    coverMaterialOptionId: product.coverMaterialOptionId ?? "",
    warrantyYears: String(
      product.attributes?.warrantyYears || product.warrantyYears || "",
    ),
    removableCover: product.attributes?.removableCover ?? "",
    flippable: product.attributes?.flippable ?? "",
    trialNights: product.attributes?.trialNights ?? "",
    idealFor: product.attributes?.idealFor ?? "",
  });
  const [bedRangeId, setBedRangeId] = useState(product.bedRangeId ?? "");
  const [colourOptionIds, setColourOptionIds] = useState<string[]>(
    product.colourOptionIds ?? [],
  );

  const template = templateForCategorySlug(category?.slug ?? "");
  const isMattress = category?.slug === "mattresses";
  const isBeds = category?.slug === "cots";
  const showsColours = !isMattress;

  const checklist = useMemo(() => {
    const items: { label: string; ok: boolean }[] = [
      { label: "Name", ok: Boolean(name.trim()) },
      { label: "Description", ok: Boolean(description.trim()) },
      { label: "Primary image", ok: Boolean(imageUrl.trim()) },
      { label: "At least one variant", ok: product.variants.length > 0 },
    ];
    if (isMattress) {
      items.push(
        { label: "Brand", ok: Boolean(mattress.mattressBrandId) },
        { label: "Mattress type", ok: Boolean(mattress.purposeOptionId) },
        { label: "Firmness", ok: Boolean(mattress.comfortOptionId) },
        {
          label: "Layer construction",
          ok: Boolean(mattress.fillingOptionId),
        },
        {
          label: "Cover fabric",
          ok: Boolean(mattress.coverMaterialOptionId),
        },
        {
          label: "Warranty",
          ok: Boolean(mattress.warrantyYears.trim()),
        },
      );
    } else if (isBeds) {
      items.push({ label: "Cot range", ok: Boolean(bedRangeId) });
    }
    if (showsColours) {
      items.push({
        label: "At least one colour",
        ok: colourOptionIds.length > 0,
      });
    }
    return items;
  }, [
    name,
    description,
    imageUrl,
    product.variants.length,
    isMattress,
    isBeds,
    showsColours,
    mattress,
    bedRangeId,
    colourOptionIds.length,
  ]);

  const readyCount = checklist.filter((c) => c.ok).length;

  function save() {
    startTransition(async () => {
      const nextAttrs = { ...attributes };
      if (isMattress) {
        nextAttrs.warrantyYears = mattress.warrantyYears.trim();
        nextAttrs.removableCover = mattress.removableCover;
        nextAttrs.flippable = mattress.flippable;
        nextAttrs.trialNights = mattress.trialNights.trim();
        nextAttrs.idealFor = mattress.idealFor.trim();
      }

      const res = await updateProductAction({
        productId: product.id,
        name,
        description,
        status,
        isFeatured: product.featured,
        imageUrl,
        mattressBrandId: isMattress ? mattress.mattressBrandId || null : null,
        bedRangeId: isBeds ? bedRangeId || null : null,
        purposeOptionId: isMattress ? mattress.purposeOptionId || null : null,
        comfortOptionId: isMattress ? mattress.comfortOptionId || null : null,
        fillingOptionId: isMattress ? mattress.fillingOptionId || null : null,
        coverMaterialOptionId: isMattress
          ? mattress.coverMaterialOptionId || null
          : null,
        attributes: nextAttrs,
        colourOptionIds: showsColours ? colourOptionIds : undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(status === "published" ? "Product published" : "Product saved");
      router.refresh();
    });
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(ROUTES.admin.products)}
        >
          <span className="hidden sm:inline">Back to products</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={save}
          className="ml-auto"
        >
          {pending ? "Saving…" : status === "published" ? "Save" : "Save draft"}
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="min-w-0 space-y-4">
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-lg">Identity</h2>
            <div className="space-y-1">
              <Label htmlFor="pe-name">Product name</Label>
              <Input
                id="pe-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={category?.name ?? "—"} disabled />
            </div>
            {isBeds ? (
              <div className="space-y-1">
                <Label htmlFor="pe-range">Cot range</Label>
                <AppSelect
                  id="pe-range"
                  value={bedRangeId}
                  onValueChange={setBedRangeId}
                  triggerClassName="w-full"
                  items={lookups.bedRanges.map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                  placeholder="Select range"
                />
              </div>
            ) : null}
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
              <AppSelect
                id="pe-status"
                value={status}
                onValueChange={(v) => setStatus(v as ProductStatus)}
                triggerClassName="w-full"
                items={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
              />
            </div>
          </section>

          <ProductEditorTemplate
            template={template}
            categorySlug={category?.slug ?? ""}
            lookups={lookups}
            mattress={mattress}
            onMattressChange={(patch) =>
              setMattress((prev) => ({ ...prev, ...patch }))
            }
            attributes={attributes}
            onAttributeChange={(key, value) =>
              setAttributes((prev) => ({ ...prev, [key]: value }))
            }
          />

          {showsColours ? (
            <ProductEditorColors
              colours={lookups.colours}
              selectedIds={colourOptionIds}
              onChange={setColourOptionIds}
            />
          ) : null}

          <ProductEditorVariants
            key={`${product.id}-${product.variants.length}`}
            productId={product.id}
            variants={product.variants}
            noColour={isMattress}
            categorySlug={category?.slug ?? ""}
          />
        </div>

        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <ProductEditorMedia
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            note={template?.note}
          />

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-lg">Publish checklist</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {readyCount}/{checklist.length} ready
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className={
                    item.ok ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  <span className="mr-1.5">{item.ok ? "✓" : "○"}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

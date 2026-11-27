"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductBasicsAction } from "@/app/admin/products/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { SaveBar } from "@/components/admin/common/save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, type ProductStatus } from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { useActionToast } from "@/hooks/use-action-toast";
import { toSlug } from "@/lib/slug";
import type { OptionItem } from "@/types/admin-products";
import { CollectionPicker } from "./collection-picker";

type ProductBasicsValues = {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  collectionIds: string[];
  /** Shop position as typed; "" = last. */
  sortOrder: string;
};

type ProductBasicsFormProps = {
  /** Omit to create a new product. */
  productId?: string;
  initial: ProductBasicsValues;
  categories: OptionItem[];
  /** Brands by category id. */
  brandsByCategory: Record<string, OptionItem[]>;
  collections: OptionItem[];
};

const toOptions = (items: OptionItem[]) => items.map((item) => ({ value: item.id, label: item.name }));

export function ProductBasicsForm({ productId, initial, categories, brandsByCategory, collections }: ProductBasicsFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(productId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const isNew = !productId;
  const brands = brandsByCategory[form.categoryId] ?? [];
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function update(changes: Partial<ProductBasicsValues>) {
    setForm({ ...form, ...changes });
  }

  function save() {
    if (isNew) {
      run(
        () => createProductAction(form),
        { loading: "Adding product…", success: "Product added. Now add its variants and prices.", error: "Could not add the product" },
        (data) => router.push(ROUTES.admin.product(data.id, "variants")),
        setErrors,
      );
      return;
    }
    run(
      () => updateProductBasicsAction(productId, form),
      { loading: "Saving…", success: "Product saved", error: "Could not save the product" },
      ({ slug }) => {
        setForm({ ...form, slug });
        setSaved({ ...form, slug });
        setErrors({});
      },
      setErrors,
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <FormField id="product-name" label="Name" error={errors.name}>
        <Input id="product-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => update({ name: event.target.value, slug: isSlugEdited ? form.slug : toSlug(event.target.value) })} />
      </FormField>
      <FormField id="product-slug" label="Slug" help="The link: /product/your-slug. If it is taken, -2 is added when you save." error={errors.slug}>
        <Input id="product-slug" value={form.slug} aria-invalid={Boolean(errors.slug)} onChange={(event) => { setIsSlugEdited(true); update({ slug: event.target.value }); }} />
      </FormField>
      <FormField id="product-category" label="Category" help={isNew ? "Cannot be changed later." : "Fixed after the product is created."} error={errors.categoryId}>
        <OptionSelect id="product-category" value={form.categoryId} disabled={!isNew} options={toOptions(categories)} isInvalid={Boolean(errors.categoryId)} onChange={(categoryId) => update({ categoryId, brandId: "" })} />
      </FormField>
      {brands.length ? (
        <FormField id="product-brand" label="Brand" error={errors.brandId}>
          <OptionSelect id="product-brand" value={form.brandId} options={toOptions(brands)} noneLabel="No brand" onChange={(brandId) => update({ brandId })} />
        </FormField>
      ) : null}
      <FormField id="product-description" label="Description" error={errors.description}>
        <Textarea id="product-description" rows={4} value={form.description} onChange={(event) => update({ description: event.target.value })} />
      </FormField>
      {isNew ? null : (
        <FormField id="product-status" label="Status" help="Published products need at least one active variant." error={errors.status}>
          <OptionSelect id="product-status" value={form.status} options={PRODUCT_STATUSES.map((status) => ({ value: status, label: PRODUCT_STATUS_LABELS[status] }))} onChange={(status) => update({ status: status as ProductStatus })} />
        </FormField>
      )}
      <FormField id="product-order" label="Order in the shop" help="1 shows first in its category. Leave empty to add it last." error={errors.sortOrder}>
        <Input id="product-order" type="number" min={1} className="w-32" value={form.sortOrder} aria-invalid={Boolean(errors.sortOrder)} onChange={(event) => update({ sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField id="product-featured" label="Featured" help="Shown in the Featured section of the home page." checked={form.isFeatured} onCheckedChange={(isFeatured) => update({ isFeatured })} />
      <CollectionPicker collections={collections} selectedIds={form.collectionIds} onChange={(collectionIds) => update({ collectionIds })} />
      {isNew ? (
        <Button type="button" disabled={isPending} onClick={save}>
          {isPending ? "Adding…" : "Add product"}
        </Button>
      ) : (
        <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setForm(saved)} />
      )}
    </div>
  );
}

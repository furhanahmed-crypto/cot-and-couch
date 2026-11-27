import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { AddonsTab } from "@/components/admin/addons/addons-tab";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { UrlTabs } from "@/components/admin/common/url-tabs";
import { ProductBasicsForm } from "@/components/admin/products/product-basics-form";
import { ProductImagesTab } from "@/components/admin/products/product-images-tab";
import { ProductSpecsTab } from "@/components/admin/products/product-specs-tab";
import { VariantsTab } from "@/components/admin/products/variants-tab";
import { buttonVariants } from "@/components/ui/button";
import { getVariantFields, hasProductAddons } from "@/constants/categories";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/format";
import { getStaffProfile, isAdmin } from "@/services/auth/require-staff";
import { getProductEditorData } from "@/services/products/editor-queries";
import { idSchema } from "@/validation/common";

export default async function ProductEditorPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [data, profile] = await Promise.all([getProductEditorData(id), getStaffProfile()]);
  if (!data) notFound();
  const { product, category } = data;
  const context = {
    productId: product.id,
    fields: getVariantFields(category.slug),
    qualities: data.qualities,
    colours: data.colours,
    canDelete: profile ? isAdmin(profile) : false,
  };

  const tabs = [
    {
      value: "basics",
      label: "Basics",
      content: (
        <ProductBasicsForm
          productId={product.id}
          initial={{ ...product, categoryId: category.id, brandId: product.brandId ?? "", description: product.description ?? "", collectionIds: data.collectionIds, sortOrder: String(product.sortOrder) }}
          categories={[{ id: category.id, name: category.name }]}
          brandsByCategory={{ [category.id]: data.brands }}
          collections={data.collections}
        />
      ),
    },
    { value: "images", label: `Images (${data.images.length})`, content: <ProductImagesTab productId={product.id} images={data.images} /> },
    { value: "specs", label: `Specs (${data.specs.length})`, content: <ProductSpecsTab productId={product.id} specs={data.specs} /> },
    { value: "variants", label: `Variants & prices (${data.variants.length})`, content: <VariantsTab variants={data.variants} context={context} /> },
  ];
  if (hasProductAddons(category.slug)) {
    tabs.push({
      value: "addons",
      label: `Add-ons (${data.addons.length})`,
      content: <AddonsTab addons={data.addons} qualities={data.qualities} scope={{ categoryId: category.id, productId: product.id, sizeLabels: [] }} />,
    });
  }

  return (
    <div className="space-y-6">
      <Link href={ROUTES.admin.products} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Products
      </Link>
      <AdminPageHeader
        title={product.name}
        description={`${category.name} · Last updated ${formatDate(product.updatedAt)}`}
        action={
          <>
            <StatusBadge label={PRODUCT_STATUS_LABELS[product.status]} tone={PRODUCT_STATUS_TONES[product.status]} />
            {product.status === "published" ? (
              <Link href={ROUTES.product(product.slug)} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
                View in shop <ExternalLink className="size-3.5" />
              </Link>
            ) : null}
          </>
        }
      />
      <UrlTabs tabs={tabs} />
    </div>
  );
}

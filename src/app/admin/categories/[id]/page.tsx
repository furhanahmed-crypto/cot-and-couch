import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AddonsTab } from "@/components/admin/addons/addons-tab";
import { BrandsTab } from "@/components/admin/categories/brands-tab";
import { CategoryDetailsForm } from "@/components/admin/categories/category-details-form";
import { QualitiesTab } from "@/components/admin/categories/qualities-tab";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { UrlTabs } from "@/components/admin/common/url-tabs";
import { ROUTES } from "@/constants/routes";
import { requireAdminPage } from "@/services/auth/require-staff";
import { getCategoryDetail } from "@/services/categories/queries";
import { idSchema } from "@/validation/common";

export default async function CategoryDetailPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const detail = await getCategoryDetail(id);
  if (!detail) notFound();
  const { category } = detail;

  return (
    <div className="space-y-6">
      <Link href={ROUTES.admin.categories} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Categories
      </Link>
      <AdminPageHeader title={category.name} description={`${category.productCount} products`} />
      <UrlTabs
        tabs={[
          { value: "details", label: "Details", content: <CategoryDetailsForm category={category} /> },
          { value: "qualities", label: `Qualities (${detail.qualities.length})`, content: <QualitiesTab categoryId={category.id} qualities={detail.qualities} /> },
          { value: "brands", label: `Brands (${detail.brands.length})`, content: <BrandsTab categoryId={category.id} brands={detail.brands} /> },
          {
            value: "addons",
            label: `Add-ons (${detail.addons.length})`,
            content: (
              <AddonsTab
                addons={detail.addons}
                qualities={detail.qualities}
                scope={{ categoryId: category.id, productId: null, sizeLabels: detail.sizeLabels }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

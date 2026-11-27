import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { ProductBasicsForm } from "@/components/admin/products/product-basics-form";
import { ROUTES } from "@/constants/routes";
import { getNewProductChoices } from "@/services/products/filter-options";

/** Step 1: basics. After saving, the editor opens on Variants & prices. */
export default async function NewProductPage() {
  const choices = await getNewProductChoices();

  return (
    <div className="space-y-6">
      <Link href={ROUTES.admin.products} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Products
      </Link>
      <AdminPageHeader title="Add product" description="Start with the basics. Variants, prices and images come next." />
      <ProductBasicsForm
        initial={{
          name: "", slug: "", categoryId: choices.categories[0]?.id ?? "", brandId: "", description: "",
          status: "draft", isFeatured: false, collectionIds: [],
        }}
        categories={choices.categories}
        brandsByCategory={choices.brandsByCategory}
        collections={choices.collections}
      />
    </div>
  );
}

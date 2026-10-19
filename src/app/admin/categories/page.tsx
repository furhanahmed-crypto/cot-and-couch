import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { AdminCategoriesList } from "@/components/admin/admin-categories-list";
import { getCategories } from "@/services/catalogue";

export const instant = false;

export default async function CategoriesPage() {
  const categories = await getCategories({ includeHidden: true });

  return (
    <AdminGate title="Categories">
      <div className="space-y-6">
        <PageHeader
          title="Categories"
          description="Live categories from Neon — visibility writes to the database."
        />
        <AdminCategoriesList categories={categories} />
      </div>
    </AdminGate>
  );
}

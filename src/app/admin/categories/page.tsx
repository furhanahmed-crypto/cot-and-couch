import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { AdminCategoryTemplates } from "@/components/admin/admin-category-templates";
import { getCategoryTemplatesData } from "@/services/admin-categories";

export const instant = false;

export default async function CategoriesPage() {
  const data = await getCategoryTemplatesData();

  return (
    <AdminGate title="Categories">
      <div className="space-y-6">
        <PageHeader
          title="Categories & templates"
          description="Four live categories — mattress brands and per-brand options open in a sheet."
        />
        <AdminCategoryTemplates data={data} />
      </div>
    </AdminGate>
  );
}

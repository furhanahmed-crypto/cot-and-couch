import Link from "next/link";
import { FolderTree } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ROUTES } from "@/constants/routes";
import { requireAdminPage } from "@/services/auth/require-staff";
import { listCategoriesForAdmin } from "@/services/categories/queries";
import type { CategoryAdminRow } from "@/types/admin-catalogue";

const COLUMNS: DataTableColumn<CategoryAdminRow>[] = [
  {
    key: "name",
    header: "Category",
    cell: (category) => (
      <Link href={ROUTES.admin.category(category.id)} className="font-medium hover:text-brass">
        {category.name}
      </Link>
    ),
  },
  { key: "products", header: "Products", align: "right", cell: (category) => category.productCount },
  {
    key: "status",
    header: "Status",
    cell: (category) => <StatusBadge label={category.isActive ? "Active" : "Inactive"} tone={category.isActive ? "strong" : "neutral"} />,
  },
  {
    key: "manage",
    header: "",
    align: "right",
    cell: (category) => (
      <Link href={ROUTES.admin.category(category.id)} className="text-sm text-muted-foreground hover:text-foreground">
        Manage
      </Link>
    ),
  },
];

export default async function CategoriesPage() {
  await requireAdminPage();
  const categories = await listCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Categories" description="Qualities, brands and add-ons of each category." />
      <DataTable
        columns={COLUMNS}
        rows={categories}
        getRowKey={(category) => category.id}
        emptyState={<EmptyState icon={FolderTree} title="No categories" description="Run the database seed to create Mattresses, Cots and Sofas." />}
      />
    </div>
  );
}

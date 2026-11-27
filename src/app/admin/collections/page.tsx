import { Layers } from "lucide-react";
import { AddCollectionButton } from "@/components/admin/collections/add-collection-button";
import { CollectionRowActions } from "@/components/admin/collections/collection-row-actions";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { requireAdminPage } from "@/services/auth/require-staff";
import { listCollectionsForAdmin } from "@/services/collections/admin";
import type { CollectionAdminRow } from "@/types/admin-catalogue";

const COLUMNS: DataTableColumn<CollectionAdminRow>[] = [
  {
    key: "name",
    header: "Collection",
    cell: (collection) => (
      <span className="font-medium">
        {collection.name}
        <span className="block text-xs font-normal text-muted-foreground">/collections/{collection.slug}</span>
      </span>
    ),
  },
  { key: "products", header: "Products", align: "right", cell: (collection) => collection.productCount },
  {
    key: "featured",
    header: "Home page",
    cell: (collection) => (collection.isFeatured ? <StatusBadge label="Featured" tone="accent" /> : <span className="text-muted-foreground">—</span>),
  },
  {
    key: "status",
    header: "Status",
    cell: (collection) => <StatusBadge label={collection.isActive ? "Active" : "Inactive"} tone={collection.isActive ? "strong" : "neutral"} />,
  },
  { key: "actions", header: "", align: "right", cell: (collection) => <CollectionRowActions collection={collection} /> },
];

export default async function CollectionsPage() {
  await requireAdminPage();
  const collections = await listCollectionsForAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Collections" description="Groups of products for the home page and shop filters." action={<AddCollectionButton />} />
      <DataTable
        columns={COLUMNS}
        rows={collections}
        getRowKey={(collection) => collection.id}
        emptyState={<EmptyState icon={Layers} title="No collections yet" description="Create one, then add products to it from the product editor." />}
      />
    </div>
  );
}

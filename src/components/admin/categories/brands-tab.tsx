"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { deleteBrandAction } from "@/app/admin/categories/brand-actions";
import { AddButton } from "@/components/admin/common/add-button";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { RowActions } from "@/components/admin/common/row-actions";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import type { BrandAdminRow } from "@/types/admin-catalogue";
import { BrandFormDialog } from "./brand-form-dialog";

function BrandRowActions({ brand }: { brand: BrandAdminRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, isPending } = useActionToast();

  function remove() {
    run(
      () => deleteBrandAction(brand.id),
      { loading: "Deleting brand…", success: "Brand deleted", error: "Could not delete the brand" },
      () => setIsConfirmingDelete(false),
    );
  }

  return (
    <>
      <RowActions
        label={brand.name}
        actions={[
          { label: "Edit", onSelect: () => setIsEditing(true) },
          { label: "Delete", onSelect: () => setIsConfirmingDelete(true), isDestructive: true },
        ]}
      />
      <BrandFormDialog key={`${brand.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} categoryId={brand.categoryId} brand={brand} />
      <ConfirmationModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete ${brand.name}?`}
        description="Brands with products cannot be deleted; switch Active off instead. This cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

const COLUMNS: DataTableColumn<BrandAdminRow>[] = [
  { key: "name", header: "Brand", cell: (brand) => <span className="font-medium">{brand.name}</span> },
  { key: "products", header: "Products", align: "right", cell: (brand) => brand.productCount },
  {
    key: "status",
    header: "Status",
    cell: (brand) => <StatusBadge label={brand.isActive ? "Active" : "Inactive"} tone={brand.isActive ? "strong" : "neutral"} />,
  },
  { key: "actions", header: "", align: "right", cell: (brand) => <BrandRowActions brand={brand} /> },
];

export function BrandsTab({ categoryId, brands }: { categoryId: string; brands: BrandAdminRow[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton
          label="Add brand"
          variant="outline"
          renderDialog={(open, onOpenChange) => <BrandFormDialog open={open} onOpenChange={onOpenChange} categoryId={categoryId} />}
        />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={brands}
        getRowKey={(brand) => brand.id}
        emptyState={<EmptyState icon={Tag} title="No brands" description="Only categories sold by brand (like mattresses) need brands." />}
      />
    </div>
  );
}

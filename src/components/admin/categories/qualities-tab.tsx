"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { deleteQualityAction } from "@/app/admin/categories/actions";
import { AddButton } from "@/components/admin/common/add-button";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { RowActions } from "@/components/admin/common/row-actions";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import type { QualityAdminRow } from "@/types/admin-catalogue";
import { QualityFormDialog } from "./quality-form-dialog";

function QualityRowActions({ quality }: { quality: QualityAdminRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, isPending } = useActionToast();

  function remove() {
    run(
      () => deleteQualityAction(quality.id),
      { loading: "Deleting quality…", success: "Quality deleted", error: "Could not delete the quality" },
      () => setIsConfirmingDelete(false),
    );
  }

  return (
    <>
      <RowActions
        label={quality.name}
        actions={[
          { label: "Edit", onSelect: () => setIsEditing(true) },
          { label: "Delete", onSelect: () => setIsConfirmingDelete(true), isDestructive: true },
        ]}
      />
      <QualityFormDialog key={`${quality.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} categoryId={quality.categoryId} quality={quality} />
      <ConfirmationModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete ${quality.name}?`}
        description="Its add-on prices are deleted too. Qualities used by products cannot be deleted; switch Active off instead. This cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

const COLUMNS: DataTableColumn<QualityAdminRow>[] = [
  {
    key: "name",
    header: "Quality",
    cell: (quality) => (
      <span className="font-medium">
        {quality.name}
        {quality.description ? <span className="block max-w-md truncate text-xs font-normal text-muted-foreground">{quality.description}</span> : null}
      </span>
    ),
  },
  { key: "warranty", header: "Warranty", cell: (quality) => (quality.warrantyYears ? `${quality.warrantyYears} years` : "—") },
  { key: "products", header: "Products", align: "right", cell: (quality) => quality.productCount },
  {
    key: "status",
    header: "Status",
    cell: (quality) => <StatusBadge label={quality.isActive ? "Active" : "Inactive"} tone={quality.isActive ? "strong" : "neutral"} />,
  },
  { key: "actions", header: "", align: "right", cell: (quality) => <QualityRowActions quality={quality} /> },
];

export function QualitiesTab({ categoryId, qualities }: { categoryId: string; qualities: QualityAdminRow[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton
          label="Add quality"
          variant="outline"
          renderDialog={(open, onOpenChange) => <QualityFormDialog open={open} onOpenChange={onOpenChange} categoryId={categoryId} />}
        />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={qualities}
        getRowKey={(quality) => quality.id}
        emptyState={<EmptyState icon={Award} title="No qualities" description="This category has no quality levels. Mattresses do not need them." />}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { deleteAddonAction } from "@/app/admin/categories/addon-actions";
import { AddButton } from "@/components/admin/common/add-button";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { RowActions } from "@/components/admin/common/row-actions";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AddonAdminRow, QualityAdminRow } from "@/types/admin-catalogue";
import { AddonFormDialog, type AddonScope } from "./addon-form-dialog";
import { AddonPriceGrid } from "./addon-price-grid";

function AddonRowActions({ addon, scope }: { addon: AddonAdminRow; scope: AddonScope }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, isPending } = useActionToast();

  function remove() {
    run(
      () => deleteAddonAction(addon.id),
      { loading: "Deleting add-on…", success: "Add-on deleted", error: "Could not delete the add-on" },
      () => setIsConfirmingDelete(false),
    );
  }

  return (
    <>
      <RowActions
        label={addon.name}
        actions={[
          { label: "Edit", onSelect: () => setIsEditing(true) },
          { label: "Delete", onSelect: () => setIsConfirmingDelete(true), isDestructive: true },
        ]}
      />
      <AddonFormDialog key={`${addon.id}-${isEditing}`} open={isEditing} onOpenChange={setIsEditing} scope={scope} addon={addon} />
      <ConfirmationModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title={`Delete ${addon.name}?`}
        description="It is removed from the shop and from carts. Past orders keep it. This cannot be undone; to hide it for now, edit it and switch Active off."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}

type AddonsTabProps = { addons: AddonAdminRow[]; qualities: QualityAdminRow[]; scope: AddonScope };

/** Add-on list plus the price grid. Used for category add-ons (cots) and product add-ons (sofas). */
export function AddonsTab({ addons, qualities, scope }: AddonsTabProps) {
  const columns: DataTableColumn<AddonAdminRow>[] = [
    { key: "name", header: "Add-on", cell: (addon) => <span className="font-medium">{addon.name}</span> },
    { key: "kind", header: "Shown as", cell: (addon) => (addon.kind === "recliner" ? "Recliner" : "Additional option") },
    { key: "size", header: "Size", cell: (addon) => addon.sizeLabel ?? "All sizes" },
    { key: "unit", header: "Price", cell: (addon) => (addon.priceUnit === "per_seat" ? "Per seat" : "One price") },
    {
      key: "status",
      header: "Status",
      cell: (addon) => <StatusBadge label={addon.isActive ? "Active" : "Inactive"} tone={addon.isActive ? "strong" : "neutral"} />,
    },
    { key: "actions", header: "", align: "right", cell: (addon) => <AddonRowActions addon={addon} scope={scope} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddButton label="Add add-on" variant="outline" renderDialog={(open, onOpenChange) => <AddonFormDialog open={open} onOpenChange={onOpenChange} scope={scope} />} />
      </div>
      <DataTable
        columns={columns}
        rows={addons}
        getRowKey={(addon) => addon.id}
        emptyState={<EmptyState icon={PackagePlus} title="No add-ons yet" description="Add extras like storage, hydraulics or recliners." />}
      />
      {qualities.length ? (
        <AddonPriceGrid addons={addons} qualities={qualities} />
      ) : (
        <p className="text-sm text-muted-foreground">Add a quality first: add-on prices are set per quality.</p>
      )}
    </div>
  );
}

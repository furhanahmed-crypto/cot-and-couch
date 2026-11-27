import { Palette } from "lucide-react";
import { AddColourButton } from "@/components/admin/colours/add-colour-button";
import { ColourRowActions } from "@/components/admin/colours/colour-row-actions";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { requireAdminPage } from "@/services/auth/require-staff";
import { listColoursForAdmin } from "@/services/colours/queries";
import type { ColourAdminRow } from "@/types/admin-catalogue";

const COLUMNS: DataTableColumn<ColourAdminRow>[] = [
  {
    key: "name",
    header: "Colour",
    cell: (colour) => (
      <span className="flex items-center gap-2 font-medium">
        <span className="size-5 rounded-full ring-1 ring-border" style={{ backgroundColor: colour.hex }} />
        {colour.name}
      </span>
    ),
  },
  { key: "hex", header: "Code", cell: (colour) => <span className="font-mono text-xs text-muted-foreground">{colour.hex}</span> },
  { key: "products", header: "Products", align: "right", cell: (colour) => colour.productCount },
  {
    key: "status",
    header: "Status",
    cell: (colour) => <StatusBadge label={colour.isActive ? "Active" : "Inactive"} tone={colour.isActive ? "strong" : "neutral"} />,
  },
  { key: "actions", header: "", align: "right", cell: (colour) => <ColourRowActions colour={colour} /> },
];

export default async function ColoursPage() {
  await requireAdminPage();
  const colours = await listColoursForAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Colours" description="Wood finishes and fabric colours for product variants." action={<AddColourButton />} />
      <DataTable
        columns={COLUMNS}
        rows={colours}
        getRowKey={(colour) => colour.id}
        emptyState={<EmptyState icon={Palette} title="No colours yet" description="Add the finishes your products come in." />}
      />
    </div>
  );
}

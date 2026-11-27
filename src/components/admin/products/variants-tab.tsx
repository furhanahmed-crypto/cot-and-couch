"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { AddButton } from "@/components/admin/common/add-button";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { OptionSelect } from "@/components/admin/common/option-select";
import type { VariantFields } from "@/constants/categories";
import { formatPrice } from "@/lib/format";
import type { QualityAdminRow } from "@/types/admin-catalogue";
import type { OptionItem, VariantAdminRow } from "@/types/admin-products";
import { BulkVariantsDialog } from "./bulk-variants-dialog";
import { VariantFormDialog } from "./variant-form-dialog";
import { VariantActiveSwitch, VariantRowActions } from "./variant-row-controls";

export type VariantEditorContext = {
  productId: string;
  fields: VariantFields;
  qualities: QualityAdminRow[];
  colours: (OptionItem & { hex: string; isActive: boolean })[];
  canDelete: boolean;
};

function buildColumns(context: VariantEditorContext): DataTableColumn<VariantAdminRow>[] {
  const nameOf = (items: OptionItem[], id: string | null) => items.find((item) => item.id === id)?.name ?? "—";
  const columns: (DataTableColumn<VariantAdminRow> | null)[] = [
    {
      key: "size",
      header: "Size",
      cell: (variant) => (
        <span className="font-medium">
          {variant.sizeLabel}
          {variant.lengthIn && variant.widthIn ? <span className="font-normal text-muted-foreground"> · {variant.lengthIn} x {variant.widthIn} in</span> : null}
          <span className="block text-xs font-normal text-muted-foreground">{variant.sku}</span>
        </span>
      ),
    },
    context.qualities.length ? { key: "quality", header: "Quality", cell: (variant) => nameOf(context.qualities, variant.qualityId) } : null,
    context.fields.thickness ? { key: "thickness", header: "Thickness", cell: (variant) => (variant.thicknessIn ? `${variant.thicknessIn} in` : "—") } : null,
    context.fields.seats ? { key: "seats", header: "Seats", align: "right", cell: (variant) => variant.seats ?? "—" } : null,
    context.fields.colour ? { key: "colour", header: "Colour", cell: (variant) => nameOf(context.colours, variant.colourId) } : null,
    { key: "mrp", header: "MRP", align: "right", cell: (variant) => (variant.mrp ? formatPrice(variant.mrp) : "—") },
    { key: "price", header: "Price", align: "right", cell: (variant) => <span className="font-medium">{formatPrice(variant.price)}</span> },
    { key: "active", header: "Active", cell: (variant) => <VariantActiveSwitch variant={variant} /> },
    { key: "actions", header: "", align: "right", cell: (variant) => <VariantRowActions variant={variant} context={context} /> },
  ];
  return columns.filter((column): column is DataTableColumn<VariantAdminRow> => column !== null);
}

/** All variants with their prices. Filter by quality or size to find rows in long lists (cots). */
export function VariantsTab({ variants, context }: { variants: VariantAdminRow[]; context: VariantEditorContext }) {
  const [qualityId, setQualityId] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const sizes = [...new Set(variants.map((variant) => variant.sizeLabel))];
  const shown = variants.filter((variant) => (!qualityId || variant.qualityId === qualityId) && (!sizeLabel || variant.sizeLabel === sizeLabel));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {context.qualities.length ? (
          <div className="sm:w-52">
            <OptionSelect id="variants-quality" value={qualityId} noneLabel="All qualities" options={context.qualities.map((quality) => ({ value: quality.id, label: quality.name }))} onChange={setQualityId} />
          </div>
        ) : null}
        {sizes.length > 1 ? (
          <div className="sm:w-44">
            <OptionSelect id="variants-size" value={sizeLabel} noneLabel="All sizes" options={sizes.map((size) => ({ value: size, label: size }))} onChange={setSizeLabel} />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">{shown.length} of {variants.length} variants</p>
        <div className="flex gap-2 sm:ml-auto">
          <AddButton label="Add many" variant="outline" renderDialog={(open, onOpenChange) => <BulkVariantsDialog open={open} onOpenChange={onOpenChange} context={context} />} />
          <AddButton label="Add variant" renderDialog={(open, onOpenChange) => <VariantFormDialog open={open} onOpenChange={onOpenChange} context={context} />} />
        </div>
      </div>
      <DataTable
        columns={buildColumns(context)}
        rows={shown}
        getRowKey={(variant) => variant.id}
        emptyState={<EmptyState icon={Ruler} title={variants.length ? "No variants match" : "No variants yet"} description="Each variant is one size (and quality, colour…) with its price." />}
      />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Boxes, ImageOff, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { TablePagination } from "@/components/admin/common/table-pagination";
import { ProductRowActions } from "@/components/admin/products/product-row-actions";
import { ProductsToolbar } from "@/components/admin/products/products-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatPrice } from "@/lib/format";
import { parseProductAdminFilters } from "@/lib/product-admin-params";
import { getStaffProfile, isAdmin } from "@/services/auth/require-staff";
import { getProductFilterOptions } from "@/services/products/filter-options";
import { listProductsForAdmin } from "@/services/products/list-queries";
import type { ProductAdminRow } from "@/types/admin-products";

function formatPriceRange(row: ProductAdminRow): string {
  if (row.minPrice === null || row.maxPrice === null) return "—";
  if (row.minPrice === row.maxPrice) return formatPrice(row.minPrice);
  return `${formatPrice(row.minPrice)} – ${formatPrice(row.maxPrice)}`;
}

function buildColumns(canDelete: boolean): DataTableColumn<ProductAdminRow>[] {
  return [
    {
      key: "image",
      header: "",
      className: "w-14",
      cell: (row) => (
        <span className="relative block size-10 overflow-hidden rounded-md bg-muted">
          {row.imageUrl ? <Image src={row.imageUrl} alt="" fill className="object-cover" sizes="40px" /> : <ImageOff className="m-3 size-4 text-muted-foreground/50" />}
        </span>
      ),
    },
    {
      key: "name",
      header: "Product",
      cell: (row) => (
        <Link href={ROUTES.admin.product(row.id)} className="font-medium hover:text-brass">
          {row.name}
          <span className="block text-xs font-normal text-muted-foreground">{[row.categoryName, row.brandName].filter(Boolean).join(" · ")}</span>
        </Link>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge label={PRODUCT_STATUS_LABELS[row.status]} tone={PRODUCT_STATUS_TONES[row.status]} /> },
    { key: "variants", header: "Variants", align: "right", cell: (row) => row.variantCount },
    { key: "price", header: "Price", align: "right", cell: formatPriceRange },
    { key: "updated", header: "Updated", cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.updatedAt)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => <ProductRowActions productId={row.id} name={row.name} slug={row.slug} status={row.status} isAdmin={canDelete} />,
    },
  ];
}

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const filters = parseProductAdminFilters(await searchParams);
  const [profile, result, options] = await Promise.all([
    getStaffProfile(),
    listProductsForAdmin(filters),
    getProductFilterOptions(filters.categoryId),
  ]);
  const hasFilters = Boolean(filters.q || filters.categoryId || filters.status || filters.brandId || filters.qualityId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Everything in the shop, with prices on each variant."
        action={
          <Link href={ROUTES.admin.newProduct} className={buttonVariants()}>
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <ProductsToolbar options={options} />
      <DataTable
        columns={buildColumns(profile ? isAdmin(profile) : false)}
        rows={result.items}
        getRowKey={(row) => row.id}
        emptyState={
          <EmptyState
            icon={Boxes}
            title={hasFilters ? "No products match these filters" : "No products yet"}
            description={hasFilters ? "Try another search or clear the filters." : "Add your first product."}
          />
        }
      />
      <TablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}

import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { TablePagination } from "@/components/admin/common/table-pagination";
import { OrdersToolbar } from "@/components/admin/orders/orders-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/constants/orders";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatPhone, formatPrice } from "@/lib/format";
import { parseOrderAdminFilters } from "@/lib/order-admin-params";
import { listOrdersForAdmin } from "@/services/orders/admin-queries";
import type { OrderAdminRow } from "@/types/admin-orders";

const muted = (text: string) => <span className="text-xs text-muted-foreground">{text}</span>;

const COLUMNS: DataTableColumn<OrderAdminRow>[] = [
  {
    key: "number",
    header: "Order no.",
    cell: (row) => (
      <Link href={ROUTES.admin.order(row.id)} className="font-medium hover:text-brass">
        {row.orderNumber}
      </Link>
    ),
  },
  { key: "customer", header: "Customer", cell: (row) => <span className="block max-w-40 truncate" title={row.customerName}>{row.customerName}</span> },
  { key: "phone", header: "Phone", cell: (row) => <span className="whitespace-nowrap">{formatPhone(row.customerPhone)}</span> },
  { key: "items", header: "Items", align: "right", cell: (row) => row.itemCount },
  { key: "total", header: "Total", align: "right", cell: (row) => formatPrice(row.subtotal) },
  { key: "advance", header: "Advance", align: "right", cell: (row) => formatPrice(row.advancePaid) },
  { key: "balance", header: "Balance", align: "right", cell: (row) => <span className="font-medium">{formatPrice(row.subtotal - row.advancePaid)}</span> },
  { key: "status", header: "Status", cell: (row) => <StatusBadge label={ORDER_STATUS_LABELS[row.status]} tone={ORDER_STATUS_TONES[row.status]} /> },
  { key: "delivery", header: "Expected delivery", cell: (row) => muted(row.expectedDelivery ? formatDate(row.expectedDelivery) : "—") },
  { key: "created", header: "Created", cell: (row) => muted(formatDate(row.createdAt)) },
];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const filters = parseOrderAdminFilters(await searchParams);
  const result = await listOrdersForAdmin(filters);
  const hasFilters = Boolean(filters.q || filters.status || filters.range !== "all");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Every order with its payment and delivery status."
        action={
          <Link href={ROUTES.admin.newOrder} className={buttonVariants()}>
            <Plus className="size-4" /> New order
          </Link>
        }
      />
      <OrdersToolbar />
      <DataTable
        columns={COLUMNS}
        rows={result.items}
        getRowKey={(row) => row.id}
        emptyState={
          <EmptyState
            icon={ReceiptText}
            title={hasFilters ? "No orders match these filters" : "No orders yet"}
            description={hasFilters ? "Try another search or clear the filters." : "Create the first order from a showroom sale."}
          />
        }
      />
      <TablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}

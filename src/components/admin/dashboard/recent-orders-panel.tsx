import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/constants/orders";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatPrice } from "@/lib/format";
import type { RecentOrder } from "@/types/dashboard";

const COLUMNS: DataTableColumn<RecentOrder>[] = [
  {
    key: "order",
    header: "Order",
    cell: (order) => (
      <Link href={ROUTES.admin.order(order.id)} className="font-medium hover:text-brass">
        {order.orderNumber}
        <span className="block text-xs font-normal text-muted-foreground">{order.customerName}</span>
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (order) => <StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />,
  },
  { key: "total", header: "Total", align: "right", cell: (order) => formatPrice(order.subtotal) },
  {
    key: "date",
    header: "Date",
    align: "right",
    cell: (order) => <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>,
  },
];

export function RecentOrdersPanel({ orders }: { orders: RecentOrder[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        <Link href={ROUTES.admin.orders} className="text-sm text-muted-foreground hover:text-foreground">
          All orders
        </Link>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={orders}
        getRowKey={(order) => order.id}
        emptyState={<EmptyState icon={ReceiptText} title="No orders yet" description="Orders created in the showroom appear here." />}
      />
    </section>
  );
}

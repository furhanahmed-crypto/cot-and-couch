import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { SectionCard } from "@/components/admin/common/section-card";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { OrderDetailsForm } from "@/components/admin/orders/order-details-form";
import { OrderItemsCard } from "@/components/admin/orders/order-items-card";
import { OrderStatusCard } from "@/components/admin/orders/order-status-card";
import { OrderTimeline } from "@/components/admin/orders/order-timeline";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/constants/orders";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatPhone } from "@/lib/format";
import { getOrderForAdmin } from "@/services/orders/admin-queries";
import { idSchema } from "@/validation/common";

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href={ROUTES.admin.orders} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Orders
      </Link>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Created ${formatDate(order.createdAt)}${order.salespersonName ? ` by ${order.salespersonName}` : ""}`}
        action={<StatusBadge label={ORDER_STATUS_LABELS[order.status]} tone={ORDER_STATUS_TONES[order.status]} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <SectionCard title="Customer">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>
                  <a href={`tel:${order.customerPhone}`} className="hover:text-brass">{formatPhone(order.customerPhone)}</a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd className="whitespace-pre-line">{order.address}</dd>
              </div>
            </dl>
            {order.hasAccount ? <p className="text-xs text-muted-foreground">Linked to the customer&apos;s account: they see this order in My orders.</p> : null}
          </SectionCard>
          <OrderItemsCard order={order} />
        </div>
        <div className="space-y-6">
          <OrderStatusCard key={order.status} orderId={order.id} status={order.status} />
          <OrderDetailsForm key={JSON.stringify([order.advancePaid, order.expectedDelivery, order.deliveryPhotoUrl, order.notes])} order={order} />
          <OrderTimeline history={order.history} />
        </div>
      </div>
    </div>
  );
}

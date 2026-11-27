import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { NewOrderForm } from "@/components/admin/orders/new-order-form";
import { ROUTES } from "@/constants/routes";
import { listOrderProducts } from "@/services/orders/new-order-queries";

export default async function NewOrderPage() {
  const products = await listOrderProducts();

  return (
    <div className="space-y-6">
      <Link href={ROUTES.admin.orders} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Orders
      </Link>
      <AdminPageHeader title="New order" description="Record a showroom sale. Prices come from the catalogue." />
      <NewOrderForm products={products} />
    </div>
  );
}

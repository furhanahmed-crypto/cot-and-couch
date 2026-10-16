import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/format";
import { getOrders } from "@/services/ops";

export default async function SalesPage() {
  const sales = await getOrders();

  return (
    <div className="space-y-6">
      <PageHeader title="Sales / orders" description="Orders from Neon." />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Salesperson</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.customerMobile}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {o.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>{formatINR(o.agreedPrice)}</TableCell>
                <TableCell>{o.expectedDelivery || "—"}</TableCell>
                <TableCell>{o.salesperson || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

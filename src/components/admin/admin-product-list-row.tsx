import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminProductRowActions } from "@/components/admin/admin-product-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatINR } from "@/lib/format";
import type { Product, ProductStatus } from "@/types";

function statusVariant(status: ProductStatus) {
  if (status === "published") return "default";
  if (status === "draft") return "secondary";
  return "outline";
}

export function AdminProductListRow({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const thumb = product.variants[0]?.images[0];
  const minPrice = Math.min(...product.variants.map((v) => v.price), Infinity);
  const qty = product.variants.reduce((s, v) => s + v.stockQty, 0);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {thumb ? (
              <Image src={thumb} alt="" fill className="object-cover" sizes="40px" />
            ) : null}
          </div>
          <span className="font-medium">{product.name}</span>
        </div>
      </TableCell>
      <TableCell>{categoryName}</TableCell>
      <TableCell>
        <Badge variant={statusVariant(product.status)} className="capitalize">
          {product.status}
        </Badge>
      </TableCell>
      <TableCell>{Number.isFinite(minPrice) ? formatINR(minPrice) : "—"}</TableCell>
      <TableCell>
        {qty} units · {product.variants.length} SKUs
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={ROUTES.admin.productEdit(product.id)} />}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <AdminProductRowActions product={product} />
        </div>
      </TableCell>
    </TableRow>
  );
}

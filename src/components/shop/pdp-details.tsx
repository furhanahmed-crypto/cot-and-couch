import Link from "next/link";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { ProductDetail } from "@/types/catalogue";

/** Description, specs and the qualities this product comes in. Only real data, no filler. */
export function PdpDetails({ product }: { product: ProductDetail }) {
  const qualitiesWithInfo = product.qualities.filter((quality) => quality.description || quality.warrantyYears);

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        {product.description ? <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p> : null}
        {product.specs.length ? (
          <Table>
            <TableBody>
              {product.specs.map((spec) => (
                <TableRow key={spec.label}>
                  <TableCell className="font-medium">{spec.label}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
        <Link href={ROUTES.category(product.categorySlug)} className="inline-block text-sm text-brass underline-offset-2 hover:underline">
          ← All {product.categoryName}
        </Link>
      </div>
      {qualitiesWithInfo.length ? (
        <div className="space-y-3">
          <h2 className="font-heading text-xl">Qualities</h2>
          <Table>
            <TableBody>
              {qualitiesWithInfo.map((quality) => (
                <TableRow key={quality.id}>
                  <TableCell className="align-top font-medium">{quality.name}</TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {quality.description}
                    {quality.warrantyYears ? <span className="block">{quality.warrantyYears}-year warranty</span> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
}

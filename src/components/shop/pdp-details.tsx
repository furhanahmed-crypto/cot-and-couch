import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inchesToCm } from "@/lib/format";
import type { Product } from "@/types";

function assemblyCopy(mode: Product["assembly"]) {
  if (mode === "pre_assembled") return "Delivered pre-assembled where possible.";
  if (mode === "carpenter") return "Carpenter assembly included within Hyderabad.";
  return "No assembly required.";
}

export function PdpDetails({ product }: { product: Product }) {
  return (
    <>
      <ul className="list-inside list-disc space-y-1 text-sm">
        {product.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Specification</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(product.specs).map(([key, val]) => (
            <TableRow key={key}>
              <TableCell className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </TableCell>
              <TableCell>{String(val)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Overall dimensions</TableCell>
            <TableCell>
              {product.dimensions.lIn}&quot; × {product.dimensions.wIn}&quot; ×{" "}
              {product.dimensions.hIn}&quot;
              {" · "}
              {inchesToCm(product.dimensions.lIn)} ×{" "}
              {inchesToCm(product.dimensions.wIn)} cm
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Accordion multiple className="rounded-xl ring-1 ring-border/60">
        <AccordionItem value="warranty">
          <AccordionTrigger>Warranty</AccordionTrigger>
          <AccordionContent>
            {product.warrantyYears}-year warranty. Exclusions:{" "}
            {product.warrantyExclusions}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="care">
          <AccordionTrigger>Care</AccordionTrigger>
          <AccordionContent>{product.care}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="assembly">
          <AccordionTrigger>Assembly</AccordionTrigger>
          <AccordionContent>{assemblyCopy(product.assembly)}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="delivery">
          <AccordionTrigger>Delivery</AccordionTrigger>
          <AccordionContent>{product.deliveryDays}</AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="text-xs text-muted-foreground">
        Material: {product.material} · Finish: {product.finish}
      </p>
      <Link
        href="/catalogue"
        className="text-sm text-brass underline-offset-2 hover:underline"
      >
        ← Back to catalogue
      </Link>
    </>
  );
}

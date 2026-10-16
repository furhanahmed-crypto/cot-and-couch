"use client";

import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brands, collections, colours, sizes } from "@/data/mock";

export default function MastersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Masters" description="Reference lists from mock data." />
      <MockBanner compact />
      <Tabs defaultValue="colours">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="colours">Colours</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
        </TabsList>
        <TabsContent value="colours" className="mt-4">
          <MasterTable
            headers={["Swatch", "Name", "Hex"]}
            rows={colours.map((c) => [
              <span
                key={c.id}
                className="inline-block size-6 rounded border border-border"
                style={{ backgroundColor: c.hex }}
              />,
              c.name,
              c.hex,
            ])}
          />
        </TabsContent>
        <TabsContent value="brands" className="mt-4">
          <MasterTable
            headers={["Name", "ID"]}
            rows={brands.map((b) => [b.name, b.id])}
          />
        </TabsContent>
        <TabsContent value="collections" className="mt-4">
          <MasterTable
            headers={["Name", "Slug", "Featured"]}
            rows={collections.map((c) => [
              c.name,
              c.slug,
              c.featured ? <Badge key={c.id}>Featured</Badge> : "—",
            ])}
          />
        </TabsContent>
        <TabsContent value="sizes" className="mt-4">
          <MasterTable
            headers={["Group", "Label", "Dimensions (in)"]}
            rows={sizes.map((s) => [s.group, s.label, `${s.lengthIn} × ${s.widthIn}`])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MasterTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cells, i) => (
            <TableRow key={i}>
              {cells.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

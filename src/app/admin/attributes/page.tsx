"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attributeTemplates, categories } from "@/data/mock";

export default function AttributesPage() {
  return (
    <AdminGate title="Attributes">
      <div className="space-y-6">
        <PageHeader
          title="Attribute templates"
          description="Read-only mock templates linked to categories."
        />
        <MockBanner compact />
        <div className="grid gap-4">
          {attributeTemplates.map((tpl) => {
            const cat = categories.find((c) => c.id === tpl.categoryId);
            return (
              <Card key={tpl.id}>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{tpl.name}</CardTitle>
                  <CardDescription>
                    Category: {cat?.name ?? tpl.categoryId} · {tpl.fields.length} fields
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Filter</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tpl.fields.map((f) => (
                        <TableRow key={f.key}>
                          <TableCell>{f.label}</TableCell>
                          <TableCell className="font-mono text-xs">{f.key}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell>
                            {f.filterable ? (
                              <Badge className="bg-brass/20 text-ink hover:bg-brass/30">Filterable</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminGate>
  );
}

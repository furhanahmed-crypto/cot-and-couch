"use client";

import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { segments } from "@/data/mock";

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Segments" description="Marketing segments from mock analytics." />
      <MockBanner compact />
      <div className="grid gap-4 sm:grid-cols-2">
        {segments.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{s.name}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl text-ink">{s.count}</p>
              <p className="text-xs text-muted-foreground">customers (mock count)</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

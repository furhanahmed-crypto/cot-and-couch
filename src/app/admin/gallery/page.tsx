"use client";

import { useState } from "react";
import Image from "next/image";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { gallery as seedGallery } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import { useStaffSession } from "@/hooks/use-staff-session";
import type { GalleryItem } from "@/types";

export default function GalleryPage() {
  const { isAdmin } = useStaffSession();
  const [items, setItems] = useState<GalleryItem[]>(() => [...seedGallery]);

  function approve(id: string) {
    if (isAdmin) {
      setItems((prev) => prev.map((g) => (g.id === id ? { ...g, approved: true } : g)));
      mockToast("Photo approved in memory");
    } else {
      mockToast("Left pending — admin must approve in mock flow");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery gallery"
        description={
          isAdmin
            ? "Admin approvals apply immediately in memory."
            : "Team uploads stay pending until admin approves (mock)."
        }
      />
      <MockBanner compact />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={g.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={g.approved ? "default" : "secondary"}>
                  {g.approved ? "Approved" : "Pending"}
                </Badge>
                <span className="text-xs text-muted-foreground">{g.area}</span>
              </div>
              <p className="text-sm text-muted-foreground">Delivered {g.deliveryMonth}</p>
              {!g.approved && (
                <Button size="sm" className="w-full bg-ink" onClick={() => approve(g.id)}>
                  {isAdmin ? "Approve" : "Mark ready for approval"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

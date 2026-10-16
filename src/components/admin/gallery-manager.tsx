"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  updateGalleryItemAction,
} from "@/app/admin/ops/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GalleryItem } from "@/types";

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [area, setArea] = useState("");
  const [month, setMonth] = useState("");

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            await createGalleryItemAction({
              imageUrl,
              area,
              deliveryMonth: month,
              approved: false,
            });
            setImageUrl("");
            setArea("");
            setMonth("");
            router.refresh();
          });
        }}
      >
        <div className="min-w-[14rem] flex-1 space-y-1">
          <Label>Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/images/…"
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Area</Label>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Month</Label>
          <Input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Oct 2026"
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> Add
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.area}</TableCell>
                <TableCell>{g.deliveryMonth}</TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs">
                  {g.image}
                </TableCell>
                <TableCell>
                  <Badge variant={g.approved ? "default" : "secondary"}>
                    {g.approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await updateGalleryItemAction({
                            id: g.id,
                            approved: !g.approved,
                            area: g.area,
                            deliveryMonth: g.deliveryMonth,
                          });
                          router.refresh();
                        });
                      }}
                    >
                      {g.approved ? "Unapprove" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await deleteGalleryItemAction(g.id);
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

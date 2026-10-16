"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createReelAction,
  deleteReelAction,
  updateReelAction,
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
import type { Reel } from "@/types";

export function ReelsManager({ items }: { items: Reel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tags, setTags] = useState("home");

  return (
    <div className="space-y-4">
      <form
        className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            await createReelAction({
              title,
              coverUrl,
              videoUrl,
              instagramUrl,
              tags,
            });
            setTitle("");
            setCoverUrl("");
            setVideoUrl("");
            router.refresh();
          });
        }}
      >
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Tags (comma)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Cover URL</Label>
          <Input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Video URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Instagram URL</Label>
          <Input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={pending} className="md:col-span-2">
          <Plus className="size-4" /> Add reel
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.tags.join(", ")}
                </TableCell>
                <TableCell>
                  <Badge variant={r.active ? "default" : "secondary"}>
                    {r.active ? "Active" : "Hidden"}
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
                          await updateReelAction({
                            id: r.id,
                            title: r.title,
                            isActive: !r.active,
                            tags: r.tags.join(", "),
                          });
                          router.refresh();
                        });
                      }}
                    >
                      {r.active ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await deleteReelAction(r.id);
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

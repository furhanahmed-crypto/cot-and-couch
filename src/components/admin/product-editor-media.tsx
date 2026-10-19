"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductEditorMedia({
  imageUrl,
  onImageUrlChange,
  note,
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  note?: string;
}) {
  const slots = imageUrl.trim()
    ? [imageUrl.trim()]
    : [null, null, null, null];

  return (
    <section className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <h2 className="font-heading text-lg">Media</h2>
        <p className="text-sm text-muted-foreground break-words">
          {note ??
            "One primary image URL per product (mattresses share photos across SKUs)."}
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="pe-image">Primary image URL</Label>
        <Input
          id="pe-image"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="/images/mattresses/… or https://…"
          className="max-w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {slots.slice(0, 4).map((url, i) => (
          <div
            key={url ?? `ph-${i}`}
            className="relative aspect-square min-w-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60"
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                Photo {i + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

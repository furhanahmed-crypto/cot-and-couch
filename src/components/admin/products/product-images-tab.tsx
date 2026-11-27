"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { saveProductImagesAction } from "@/app/admin/products/content-actions";
import { SaveBar } from "@/components/admin/common/save-bar";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { ListEditor } from "./list-editor";

type ImageRow = { url: string; alt: string };

function canPreview(url: string): boolean {
  return url.startsWith("/") || url.startsWith("https://");
}

/** Image URLs with alt text. The first one is the cover in the shop. */
export function ProductImagesTab({ productId, images }: { productId: string; images: { url: string; alt: string | null }[] }) {
  const [saved, setSaved] = useState<ImageRow[]>(() => images.map((image) => ({ url: image.url, alt: image.alt ?? "" })));
  const [rows, setRows] = useState(saved);
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(rows) !== JSON.stringify(saved);

  function save() {
    run(
      () => saveProductImagesAction({ productId, images: rows }),
      { loading: "Saving images…", success: "Images saved", error: "Could not save the images" },
      () => setSaved(rows),
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Paste an image link (starting with / for files in the site, or https://). The first image is the cover.
      </p>
      <ListEditor
        items={rows}
        onChange={setRows}
        newItem={() => ({ url: "", alt: "" })}
        addLabel="Add image"
        renderItem={(row, update, position) => (
          <div className="flex gap-3">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {canPreview(row.url) ? (
                <Image src={row.url} alt="" fill className="object-cover" sizes="64px" unoptimized />
              ) : (
                <ImageOff className="m-5 size-6 text-muted-foreground/50" />
              )}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <Input aria-label={`Image ${position + 1} link`} placeholder="/images/… or https://…" value={row.url} onChange={(event) => update({ ...row, url: event.target.value.trim() })} />
              <Input aria-label={`Image ${position + 1} description`} placeholder="Description for screen readers" value={row.alt} onChange={(event) => update({ ...row, alt: event.target.value })} />
              {position === 0 ? <p className="text-xs text-muted-foreground">Cover image</p> : null}
            </div>
          </div>
        )}
      />
      <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setRows(saved)} saveLabel="Save images" />
    </div>
  );
}

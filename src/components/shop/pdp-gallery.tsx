"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PdpGalleryProps = { images: string[]; alt: string; className?: string };

export function PdpGallery({ images, alt, className }: PdpGalleryProps) {
  const [index, setIndex] = useState(0);
  const main = images[index] ?? images[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60">
        {main ? (
          <Image key={main} src={main} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-10 opacity-50" />
            <span className="text-sm">Photos coming soon</span>
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, position) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${position + 1}`}
              onClick={() => setIndex(position)}
              className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-border",
                index === position && "ring-2 ring-brass",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

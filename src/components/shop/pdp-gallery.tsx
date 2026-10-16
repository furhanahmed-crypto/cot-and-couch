"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function PdpGallery({
  images,
  videos = [],
  alt,
  className,
}: {
  images: string[];
  videos?: string[];
  alt: string;
  className?: string;
}) {
  const hasVideo = videos.length > 0;
  const imagesKey = images.join("|");
  const [mode, setMode] = useState<"image" | "video">("image");
  const [index, setIndex] = useState(0);
  const [seenKey, setSeenKey] = useState(imagesKey);

  if (imagesKey !== seenKey) {
    setSeenKey(imagesKey);
    setIndex(0);
    setMode("image");
  }

  const main = images[index] ?? images[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60">
        {mode === "video" && hasVideo ? (
          <video
            key={videos[0]}
            src={videos[0]}
            controls
            playsInline
            className="size-full object-cover"
            poster={main}
          />
        ) : (
          main && (
            <Image
              key={main}
              src={main}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
              priority
            />
          )
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hasVideo && (
          <button
            type="button"
            onClick={() => setMode("video")}
            className={cn(
              "relative flex size-14 shrink-0 items-center justify-center rounded-lg ring-1 ring-border bg-ink text-white",
              mode === "video" && "ring-2 ring-brass",
            )}
            aria-label="Play product video"
          >
            <Play className="size-5" />
          </button>
        )}
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => {
              setMode("image");
              setIndex(i);
            }}
            className={cn(
              "relative size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-border",
              mode === "image" && index === i && "ring-2 ring-brass",
            )}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="56px" />
          </button>
        ))}
      </div>
    </div>
  );
}

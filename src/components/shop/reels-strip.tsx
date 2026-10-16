import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { getReels } from "@/services/ops";
import { cn } from "@/lib/utils";
import type { Reel } from "@/types";

export async function ReelsStrip({
  tag = "home",
  className,
  reels,
}: {
  tag?: string;
  className?: string;
  /** Preloaded reels; if omitted, loads from Neon. */
  reels?: Reel[];
}) {
  const allReels = reels ?? (await getReels());
  const items = allReels
    .filter((r) => r.active && r.tags.includes(tag))
    .sort((a, b) => a.order - b.order);

  if (!items.length) return null;

  return (
    <section className={cn("space-y-3", className)} aria-label="Instagram reels">
      <div className="flex items-end justify-between gap-3 px-1">
        <h2 className="font-heading text-xl tracking-tight">
          From the showroom
        </h2>
        <p className="text-xs text-muted-foreground">
          Hosted videos · View on Instagram
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {items.map((reel) => (
          <a
            key={reel.id}
            href={reel.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative w-36 shrink-0 snap-start overflow-hidden rounded-2xl bg-ink text-primary-foreground ring-1 ring-border"
          >
            <div className="relative aspect-[9/16]">
              <Image
                src={reel.cover}
                alt={reel.title}
                fill
                className="object-cover opacity-90"
                sizes="144px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <Play className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <p className="line-clamp-2 text-xs font-medium">{reel.title}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/80">
                  View on Instagram <ExternalLink className="size-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

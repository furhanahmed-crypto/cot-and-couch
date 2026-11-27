import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { listReels } from "@/services/media/queries";

type ReelsStripProps = {
  /** Only reels with this tag: "home", a category slug, a product slug… */
  tag: string;
  className?: string;
};

export async function ReelsStrip({ tag, className }: ReelsStripProps) {
  const reels = await listReels(tag);
  if (!reels.length) return null;

  return (
    <section className={cn("space-y-3", className)} aria-label="Showroom reels">
      <h2 className="px-1 font-heading text-xl tracking-tight">From the showroom</h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {reels.map((reel) => (
          <a
            key={reel.id}
            href={reel.instagramUrl ?? reel.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative w-36 shrink-0 snap-start overflow-hidden rounded-2xl bg-ink text-primary-foreground ring-1 ring-border"
          >
            <div className="relative aspect-[9/16]">
              <Image src={reel.coverUrl} alt={reel.title} fill className="object-cover opacity-90" sizes="144px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <Play className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <p className="line-clamp-2 text-xs font-medium">{reel.title}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/80">
                  {reel.instagramUrl ? "View on Instagram" : "Watch video"} <ExternalLink className="size-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/types/shop";

const SLIDE_DELAY_MS = 5000;

type HeroDotsProps = { count: number; selected: number; onPick: (index: number) => void };

function HeroDots({ count, selected, onPick }: HeroDotsProps) {
  return (
    <div className="mt-6 flex gap-2" role="tablist" aria-label="Hero slides">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === selected}
          aria-label={`Go to slide ${index + 1}`}
          className={cn("h-1 rounded-full transition-all duration-500", index === selected ? "w-8 bg-brass" : "w-4 bg-white/40 hover:bg-white/70")}
          onClick={() => onPick(index)}
        />
      ))}
    </div>
  );
}

/** Delivered-home photos (published gallery), each linking to its product. */
export function HomeHero({ photos }: { photos: GalleryPhoto[] }) {
  const slides = photos;
  const [selected, setSelected] = useState(0);

  const plugins = useMemo(() => [Fade(), Autoplay({ delay: SLIDE_DELAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })], []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, plugins);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!slides.length) return null;

  const active = slides[selected] ?? slides[0];

  return (
    <section
      className="relative min-h-[72vh] overflow-hidden bg-ink text-white md:min-h-[78vh]"
      aria-roledescription="carousel"
      aria-label="Recent deliveries"
    >
      <div ref={emblaRef} className="absolute inset-0">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${slides.length}`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.productName ?? "Recent delivery"}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />

      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 md:min-h-[78vh] md:px-6 md:pb-14">
        <div className="fade-up">
          <BrandMark tone="dark" href="/" className="pointer-events-none [&_img]:h-10 md:[&_img]:h-12" />
        </div>
        <h1 className="fade-up font-heading mt-4 max-w-xl text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          Furniture worth visiting for
        </h1>
        <p className="fade-up-delay mt-3 max-w-md text-sm text-white/80 md:text-base">
          {BRAND.tagline}
        </p>
        {active.productSlug && (
          <Link
            href={ROUTES.product(active.productSlug)}
            prefetch={false}
            className="fade-up-delay mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur transition hover:bg-white/20"
          >
            {[active.area && `Delivered in ${active.area}`, active.deliveryMonth].filter(Boolean).join(" · ")}
            <span className="text-brass">View {active.productName}</span>
          </Link>
        )}
        <HeroDots count={slides.length} selected={selected} onPick={(index) => emblaApi?.scrollTo(index)} />
      </div>
    </section>
  );
}

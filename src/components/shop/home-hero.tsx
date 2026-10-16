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
import type { GalleryItem, Product } from "@/types";

function resolveProduct(products: Product[], productId: string) {
  return products.find(
    (p) =>
      p.id === productId ||
      p.slug === productId ||
      p.slug === productId.replace(/^prod-/, ""),
  );
}

export function HomeHero({
  products,
  gallery,
}: {
  products: Product[];
  gallery: GalleryItem[];
}) {
  const slides = gallery.filter((g) => g.approved);
  const [selected, setSelected] = useState(0);

  const plugins = useMemo(
    () => [
      Fade(),
      Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
    ],
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    plugins,
  );

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
  const product = resolveProduct(products, active.productId);

  return (
    <section
      className="relative min-h-[72vh] overflow-hidden bg-ink text-white md:min-h-[78vh]"
      aria-roledescription="carousel"
      aria-label="Recent deliveries"
    >
      <div ref={emblaRef} className="absolute inset-0">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, idx) => {
            const slideProduct = resolveProduct(products, slide.productId);
            return (
              <div
                key={slide.id}
                className="relative min-w-0 shrink-0 grow-0 basis-full"
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${slides.length}`}
              >
                <Image
                  src={slide.image}
                  alt={slideProduct?.name ?? "Recent delivery"}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            );
          })}
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
        {product && (
          <Link
            href={ROUTES.product(product.slug)}
            className="fade-up-delay mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur transition hover:bg-white/20"
          >
            Delivered in {active.area} · {active.deliveryMonth}
            <span className="text-brass">View {product.name}</span>
          </Link>
        )}
        <div className="mt-6 flex gap-2" role="tablist" aria-label="Hero slides">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === selected}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                idx === selected ? "w-8 bg-brass" : "w-4 bg-white/40 hover:bg-white/70",
              )}
              onClick={() => emblaApi?.scrollTo(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

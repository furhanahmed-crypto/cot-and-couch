import Image from "next/image";
import Link from "next/link";
import { BRAND, LOGOS } from "@/constants/brand";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href?: string;
  className?: string;
  compact?: boolean;
  /** auto = theme-aware; light/dark/white = force one asset */
  tone?: "auto" | "light" | "dark" | "white";
};

export function BrandMark({
  href = "/",
  className,
  compact,
  tone = "auto",
}: BrandMarkProps) {
  /* Fits inside h-14 / md:h-16 headers without growing bar height */
  const height = compact ? "h-9 md:h-10" : "h-10 md:h-12";

  const imgClass = cn("w-auto max-h-full object-contain object-left", height);

  return (
    <Link
      href={href}
      prefetch
      className={cn("group inline-flex max-h-full shrink-0 items-center", className)}
      aria-label={BRAND.name}
    >
      {tone === "white" ? (
        <Image
          src={LOGOS.white}
          alt={BRAND.name}
          width={2086}
          height={754}
          priority
          unoptimized
          className={imgClass}
        />
      ) : (
        <>
          {(tone === "auto" || tone === "light") && (
            <Image
              src={LOGOS.light}
              alt={BRAND.name}
              width={2086}
              height={754}
              priority
              unoptimized
              className={cn(imgClass, tone === "auto" && "dark:hidden")}
            />
          )}
          {(tone === "auto" || tone === "dark") && (
            <Image
              src={LOGOS.dark}
              alt={BRAND.name}
              width={2086}
              height={754}
              priority
              unoptimized
              className={cn(imgClass, tone === "auto" && "hidden dark:block")}
            />
          )}
        </>
      )}
    </Link>
  );
}

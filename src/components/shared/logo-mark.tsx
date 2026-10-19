import Image from "next/image";
import Link from "next/link";
import { BRAND, LOGOS } from "@/constants/brand";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  href?: string;
  className?: string;
  /** Match BrandMark compact height by default */
  compact?: boolean;
  /** auto = theme-aware; light/dark/white = force one cropped asset */
  tone?: "auto" | "light" | "dark" | "white";
};

/**
 * House mark cropped from the official logo PNGs (same colours as wordmark).
 */
export function LogoMark({
  href,
  className,
  compact = true,
  tone = "auto",
}: LogoMarkProps) {
  const height = compact ? "h-9 md:h-10" : "h-10 md:h-12";
  const imgClass = cn("w-auto max-h-full object-contain", height);

  const images = (
    <>
      {tone === "white" ? (
        <Image
          src={LOGOS.markWhite}
          alt={BRAND.name}
          width={735}
          height={735}
          priority
          unoptimized
          className={imgClass}
        />
      ) : (
        <>
          {(tone === "auto" || tone === "light") && (
            <Image
              src={LOGOS.markLight}
              alt={BRAND.name}
              width={732}
              height={732}
              priority
              unoptimized
              className={cn(imgClass, tone === "auto" && "dark:hidden")}
            />
          )}
          {(tone === "auto" || tone === "dark") && (
            <Image
              src={LOGOS.markDark}
              alt={BRAND.name}
              width={703}
              height={703}
              priority
              unoptimized
              className={cn(imgClass, tone === "auto" && "hidden dark:block")}
            />
          )}
        </>
      )}
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {images}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={BRAND.name}
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {images}
    </Link>
  );
}

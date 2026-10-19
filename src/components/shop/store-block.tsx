import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getStoreInfo } from "@/services/ops";
import { cn } from "@/lib/utils";

export async function StoreBlock() {
  const storeInfo = await getStoreInfo();
  const wa = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent("Hi Cot & Couch, I'd like to visit the Lingampally showroom.")}`;

  return (
    <section className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brass">
            Showroom
          </p>
          <h2 className="font-heading text-2xl md:text-3xl">{storeInfo.name}</h2>
          <p className="flex gap-2 text-sm text-primary-foreground/85">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brass" />
            {storeInfo.address}
          </p>
          <p className="flex gap-2 text-sm text-primary-foreground/85">
            <Clock className="mt-0.5 size-4 shrink-0 text-brass" />
            {storeInfo.timings}
          </p>
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row md:flex-col">
          <a
            href={storeInfo.mapUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants(),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Open in Maps
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a
            href={`tel:${storeInfo.phone.replace(/\s/g, "")}`}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            <Phone className="size-4" /> Call
          </a>
        </div>
      </div>
    </section>
  );
}

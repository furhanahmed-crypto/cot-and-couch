"use client";

import { useState } from "react";
import { Clock, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoreInfo } from "@/types";

export function PdpCtaBar({
  productName,
  productUrl,
  storeInfo,
}: {
  productName: string;
  productUrl: string;
  storeInfo: StoreInfo;
}) {
  const [visitOpen, setVisitOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [slotNote, setSlotNote] = useState("");
  const [callbackNote, setCallbackNote] = useState("");

  function openWhatsApp() {
    const url = `${window.location.origin}${productUrl}`;
    const href = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
      `Hi Cot & Couch, I'm interested in ${productName}.\n${url}`,
    )}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const submitVisit = () => {
    toast.success("Visit request noted — our team will confirm on WhatsApp.");
    setSlotNote("");
    setVisitOpen(false);
  };

  const submitCallback = () => {
    toast.success("Callback request received. We'll call you shortly.");
    setCallbackNote("");
    setContactOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl gap-2 md:gap-3">
        <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
          <DialogTrigger
            render={
              <Button className="flex-1">
                <Store className="size-4" /> Visit Store
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Visit {storeInfo.name}</DialogTitle>
              <DialogDescription>{storeInfo.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="flex gap-2 text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-brass" />
                {storeInfo.timings}
              </p>
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={
                  <a href={storeInfo.mapUrl} target="_blank" rel="noreferrer" />
                }
              >
                <MapPin className="size-4" /> Open in Maps
              </Button>
              <div className="space-y-2">
                <Label htmlFor="visit-slot">Preferred visit time (optional)</Label>
                <Textarea
                  id="visit-slot"
                  value={slotNote}
                  onChange={(e) => setSlotNote(e.target.value)}
                  placeholder="e.g. Saturday 4–6 PM, coming with family"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitVisit}>
                Request visit slot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" className="flex-1">
                <Phone className="size-4" /> Contact
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact showroom</DialogTitle>
              <DialogDescription>About {productName}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                nativeButton={false}
                render={<a href={`tel:${storeInfo.phone.replace(/\s/g, "")}`} />}
              >
                <Phone className="size-4" /> Call {storeInfo.phone}
              </Button>
              <Button
                className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
                onClick={openWhatsApp}
              >
                <MessageCircle className="size-4" /> WhatsApp
              </Button>
              <div className="space-y-2 pt-2">
                <Label htmlFor="callback">Request a callback</Label>
                <Textarea
                  id="callback"
                  value={callbackNote}
                  onChange={(e) => setCallbackNote(e.target.value)}
                  placeholder="Best time to call, questions about this product…"
                  rows={3}
                />
                <Button onClick={submitCallback} className="w-full">
                  Send callback request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

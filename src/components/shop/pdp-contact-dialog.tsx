"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { recordCtaAction } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { StoreInfo } from "@/types/shop";

type PdpContactDialogProps = { productId: string; productName: string; productUrl: string; storeInfo: StoreInfo };

/** "Contact": call, WhatsApp with the product link, or ask for a callback. */
export function PdpContactDialog({ productId, productName, productUrl, storeInfo }: PdpContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const { run, isPending } = useActionToast();

  function openWhatsApp() {
    void recordCtaAction({ action: "whatsapp", productId });
    const text = `Hi Cot & Couch, I'm interested in ${productName}.\n${window.location.origin}${productUrl}`;
    window.open(`https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function submitCallback() {
    run(
      () => recordCtaAction({ action: "callback", productId, note }),
      { loading: "Sending callback request…", success: "Callback request sent", error: "Could not send your request" },
      () => {
        setNote("");
        setOpen(false);
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            render={<a href={`tel:${storeInfo.phone.replace(/\s/g, "")}`} onClick={() => void recordCtaAction({ action: "call", productId })} />}
          >
            <Phone className="size-4" /> Call {storeInfo.phone}
          </Button>
          <Button className="bg-[#25D366] text-white hover:bg-[#25D366]/90" onClick={openWhatsApp}>
            <MessageCircle className="size-4" /> WhatsApp
          </Button>
          <div className="space-y-2 pt-2">
            <Label htmlFor="callback">Request a callback</Label>
            <Textarea id="callback" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Best time to call, questions about this product…" rows={3} />
            <Button onClick={submitCallback} className="w-full" disabled={isPending}>
              Send callback request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

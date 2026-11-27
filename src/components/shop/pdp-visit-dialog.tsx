"use client";

import { useState } from "react";
import { Clock, MapPin, Store } from "lucide-react";
import { recordCtaAction } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { StoreInfo } from "@/types/shop";

type PdpVisitDialogProps = { productId: string; storeInfo: StoreInfo };

/** "Visit Store": address, timings, map link and an optional preferred time. */
export function PdpVisitDialog({ productId, storeInfo }: PdpVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const { run, isPending } = useActionToast();

  function submit() {
    run(
      () => recordCtaAction({ action: "visit", productId, note }),
      { loading: "Sending visit request…", success: "Visit request sent. The showroom will contact you.", error: "Could not send your request" },
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
            render={<a href={storeInfo.mapUrl} target="_blank" rel="noreferrer" onClick={() => void recordCtaAction({ action: "maps", productId })} />}
          >
            <MapPin className="size-4" /> Open in Maps
          </Button>
          <div className="space-y-2">
            <Label htmlFor="visit-slot">Preferred visit time (optional)</Label>
            <Textarea id="visit-slot" value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Saturday 4–6 PM, coming with family" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={isPending}>
            Request visit slot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

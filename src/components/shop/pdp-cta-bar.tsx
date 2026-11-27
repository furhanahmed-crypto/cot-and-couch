import type { StoreInfo } from "@/types/shop";
import { PdpContactDialog } from "./pdp-contact-dialog";
import { PdpVisitDialog } from "./pdp-visit-dialog";

type PdpCtaBarProps = { productId: string; productName: string; productUrl: string; storeInfo: StoreInfo };

/** Visit, call, WhatsApp and callback. Each tap is saved on the customer's lead for staff follow-up. */
export function PdpCtaBar({ productId, productName, productUrl, storeInfo }: PdpCtaBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl gap-2 md:gap-3">
        <PdpVisitDialog productId={productId} storeInfo={storeInfo} />
        <PdpContactDialog productId={productId} productName={productName} productUrl={productUrl} storeInfo={storeInfo} />
      </div>
    </div>
  );
}

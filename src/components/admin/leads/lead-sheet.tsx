"use client";

import { useState } from "react";
import { deleteLeadAction } from "@/app/admin/leads/actions";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LEAD_INTENT_LABELS, LEAD_INTENT_TONES } from "@/constants/leads";
import { useActionToast } from "@/hooks/use-action-toast";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatDate, formatPhone } from "@/lib/format";
import type { LeadDetail } from "@/types/admin-leads";
import type { OptionItem } from "@/types/admin-products";
import { LeadActivity } from "./lead-activity";
import { LeadEditForm } from "./lead-edit-form";

type LeadSheetProps = { lead: LeadDetail; staff: OptionItem[]; canDelete: boolean };

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Opened by `?lead=id`; closing removes it and keeps the filters. */
export function LeadSheet({ lead, staff, canDelete }: LeadSheetProps) {
  const { setParams } = useUrlParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const { run, isPending } = useActionToast();
  const close = () => setParams({ lead: null }, { keepPage: true });

  function remove() {
    run(() => deleteLeadAction(lead.id), { loading: "Deleting lead…", success: "Lead deleted", error: "Could not delete the lead" }, () => {
      setIsConfirming(false);
      close();
    });
  }

  return (
    <Sheet open onOpenChange={(open) => (open ? null : close())}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{lead.name}</SheetTitle>
          <SheetDescription>Last seen {formatDate(lead.lastSeenAt)}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <dl className="grid grid-cols-2 gap-3">
            <Detail label="Phone">{lead.phone ? <a href={`tel:${lead.phone}`} className="hover:text-brass">{formatPhone(lead.phone)}</a> : "—"}</Detail>
            <Detail label="Intent"><StatusBadge label={LEAD_INTENT_LABELS[lead.intent]} tone={LEAD_INTENT_TONES[lead.intent]} /></Detail>
            <Detail label="Email">{lead.email ?? "—"}</Detail>
            <Detail label="Area">{lead.area ?? "—"}</Detail>
            <Detail label="First seen">{formatDate(lead.firstSeenAt)}</Detail>
            <Detail label="WhatsApp offers">{lead.wantsWhatsappOffers ? "Yes" : "No"}</Detail>
          </dl>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Follow-up</h3>
            <LeadEditForm key={`${lead.intent}-${lead.assignedToId}-${lead.followUpDone}`} lead={lead} staff={staff} />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Activity</h3>
            <LeadActivity events={lead.events} />
          </section>
          {canDelete ? (
            <Button type="button" variant="outline" className="w-full text-destructive" onClick={() => setIsConfirming(true)}>
              Delete lead
            </Button>
          ) : null}
        </div>
        <ConfirmationModal
          open={isConfirming}
          onOpenChange={setIsConfirming}
          title={`Delete ${lead.name}?`}
          description="The lead and its activity are removed. Their account and orders stay. This cannot be undone."
          confirmLabel="Delete lead"
          pending={isPending}
          onConfirm={remove}
        />
      </SheetContent>
    </Sheet>
  );
}

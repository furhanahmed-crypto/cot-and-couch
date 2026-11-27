"use client";

import { useState } from "react";
import { changeOrderStatusAction } from "@/app/admin/orders/actions";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { SectionCard } from "@/components/admin/common/section-card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/constants/orders";
import { useActionToast } from "@/hooks/use-action-toast";

/** These close the normal flow, so staff confirm first. */
const CONFIRM_STATUSES: OrderStatus[] = ["closed", "issue"];
const STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] }));

export function OrderStatusCard({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(status);
  const [note, setNote] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const { run, isPending } = useActionToast();
  const isUnchanged = nextStatus === status;

  function save() {
    run(
      () => changeOrderStatusAction({ orderId, status: nextStatus, note }),
      { loading: "Changing status…", success: `Status changed to ${ORDER_STATUS_LABELS[nextStatus]}`, error: "Could not change the status" },
      () => {
        setNote("");
        setIsConfirming(false);
      },
    );
  }

  return (
    <SectionCard title="Change status">
      <OptionSelect id="order-status" value={nextStatus} options={STATUS_OPTIONS} onChange={(value) => setNextStatus(value as OrderStatus)} />
      <FormField id="order-status-note" label="Note (optional)" help="Saved with this change in the history.">
        <Textarea id="order-status-note" rows={2} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />
      </FormField>
      <Button
        type="button"
        className="w-full"
        disabled={isUnchanged || isPending}
        onClick={() => (CONFIRM_STATUSES.includes(nextStatus) ? setIsConfirming(true) : save())}
      >
        Save status
      </Button>
      <ConfirmationModal
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title={`Mark this order as ${ORDER_STATUS_LABELS[nextStatus]}?`}
        description={nextStatus === "closed" ? "Closed orders are finished and drop off the open orders count." : "The order is flagged so the team follows it up."}
        confirmLabel={`Mark as ${ORDER_STATUS_LABELS[nextStatus]}`}
        destructive={nextStatus === "closed"}
        pending={isPending}
        onConfirm={save}
      />
    </SectionCard>
  );
}

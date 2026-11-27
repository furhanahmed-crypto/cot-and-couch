"use client";

import { useState } from "react";
import { updateOrderDetailsAction } from "@/app/admin/orders/actions";
import { FormField } from "@/components/admin/common/form-field";
import { MoneyInput } from "@/components/admin/common/money-input";
import { SectionCard } from "@/components/admin/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatPrice } from "@/lib/format";
import type { OrderDetail } from "@/types/admin-orders";

function toForm(order: OrderDetail) {
  return {
    advancePaid: String(order.advancePaid),
    expectedDelivery: order.expectedDelivery ?? "",
    deliveryPhotoUrl: order.deliveryPhotoUrl ?? "",
    notes: order.notes ?? "",
  };
}

/** Payment and delivery fields that change while the order is in progress. */
export function OrderDetailsForm({ order }: { order: OrderDetail }) {
  const [form, setForm] = useState(() => toForm(order));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(toForm(order));

  function save() {
    run(
      () => updateOrderDetailsAction(order.id, form),
      { loading: "Saving order…", success: "Order saved", error: "Could not save the order" },
      () => setErrors({}),
      setErrors,
    );
  }

  return (
    <SectionCard title="Payment and delivery">
      <FormField id="order-advance" label="Advance paid" help={`Order total ${formatPrice(order.subtotal)}.`} error={errors.advancePaid}>
        <MoneyInput id="order-advance" value={form.advancePaid} aria-invalid={Boolean(errors.advancePaid)} onValueChange={(advancePaid) => setForm({ ...form, advancePaid })} />
      </FormField>
      <FormField id="order-delivery" label="Expected delivery" error={errors.expectedDelivery}>
        <Input id="order-delivery" type="date" value={form.expectedDelivery} onChange={(event) => setForm({ ...form, expectedDelivery: event.target.value })} />
      </FormField>
      <FormField id="order-photo" label="Delivery photo link" help="Link to the photo taken at delivery." error={errors.deliveryPhotoUrl}>
        <Input id="order-photo" type="url" placeholder="https://" value={form.deliveryPhotoUrl} aria-invalid={Boolean(errors.deliveryPhotoUrl)} onChange={(event) => setForm({ ...form, deliveryPhotoUrl: event.target.value })} />
      </FormField>
      <FormField id="order-notes" label="Notes" error={errors.notes}>
        <Textarea id="order-notes" rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </FormField>
      <Button type="button" className="w-full" disabled={!isDirty || isPending} onClick={save}>
        Save
      </Button>
    </SectionCard>
  );
}

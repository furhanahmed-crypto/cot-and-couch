"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/app/admin/orders/actions";
import { FormField } from "@/components/admin/common/form-field";
import { MoneyInput } from "@/components/admin/common/money-input";
import { SectionCard } from "@/components/admin/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { useActionToast } from "@/hooks/use-action-toast";
import type { OptionItem } from "@/types/admin-products";
import type { DraftOrderItem } from "./add-order-item-dialog";
import { CustomerSearch } from "./customer-search";
import { OrderItemsEditor } from "./order-items-editor";

const EMPTY_FORM = { profileId: "", customerName: "", customerPhone: "", address: "", expectedDelivery: "", advancePaid: "", notes: "" };

/** The first "items…" error from the server, for the items card. */
function findItemsError(errors: Record<string, string>): string | undefined {
  return Object.entries(errors).find(([field]) => field === "items" || field.startsWith("items."))?.[1];
}

export function NewOrderForm({ products }: { products: OptionItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState<DraftOrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const update = (changes: Partial<typeof EMPTY_FORM>) => setForm({ ...form, ...changes });

  function submit() {
    const input = {
      ...form,
      items: items.map((item) => ({
        variantId: item.variantId, quantity: item.quantity, addonIds: item.addonIds,
        customLengthIn: item.customLengthIn, customWidthIn: item.customWidthIn,
      })),
    };
    run(
      () => createOrderAction(input),
      { loading: "Creating order…", success: "Order created", error: "Could not create the order" },
      ({ id }) => router.push(ROUTES.admin.order(id)),
      setErrors,
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <SectionCard title="Customer">
          <CustomerSearch
            onPick={(customer) =>
              update({ profileId: customer.profileId, customerName: customer.name, customerPhone: customer.phone ?? "", address: customer.address ?? "" })
            }
          />
          {form.profileId ? <p className="text-xs text-muted-foreground">Linked to this customer&apos;s account: they will see the order in My orders.</p> : null}
          <FormField id="order-name" label="Name" error={errors.customerName}>
            <Input id="order-name" value={form.customerName} aria-invalid={Boolean(errors.customerName)} onChange={(event) => update({ customerName: event.target.value })} />
          </FormField>
          <FormField id="order-phone" label="Phone" help="10-digit mobile number." error={errors.customerPhone}>
            <Input id="order-phone" type="tel" inputMode="numeric" value={form.customerPhone} aria-invalid={Boolean(errors.customerPhone)} onChange={(event) => update({ customerPhone: event.target.value })} />
          </FormField>
          <FormField id="order-address" label="Delivery address" error={errors.address}>
            <Textarea id="order-address" rows={3} value={form.address} aria-invalid={Boolean(errors.address)} onChange={(event) => update({ address: event.target.value })} />
          </FormField>
          {form.profileId ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => update({ profileId: "" })}>
              Unlink account
            </Button>
          ) : null}
        </SectionCard>
        <OrderItemsEditor items={items} products={products} onChange={setItems} error={findItemsError(errors)} />
      </div>
      <SectionCard title="Payment and delivery" className="h-fit">
        <FormField id="order-advance" label="Advance paid" help="Cannot be more than the total." error={errors.advancePaid}>
          <MoneyInput id="order-advance" value={form.advancePaid} aria-invalid={Boolean(errors.advancePaid)} onValueChange={(advancePaid) => update({ advancePaid })} />
        </FormField>
        <FormField id="order-delivery" label="Expected delivery" error={errors.expectedDelivery}>
          <Input id="order-delivery" type="date" value={form.expectedDelivery} onChange={(event) => update({ expectedDelivery: event.target.value })} />
        </FormField>
        <FormField id="order-notes" label="Notes" error={errors.notes}>
          <Textarea id="order-notes" rows={3} value={form.notes} onChange={(event) => update({ notes: event.target.value })} />
        </FormField>
        <p className="text-xs text-muted-foreground">The total is worked out again from current prices when you create the order.</p>
        <Button type="button" className="w-full" disabled={isPending} onClick={submit}>
          {isPending ? "Creating…" : "Create order"}
        </Button>
      </SectionCard>
    </div>
  );
}

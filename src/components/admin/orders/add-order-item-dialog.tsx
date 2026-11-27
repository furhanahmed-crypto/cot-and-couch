"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { listOrderVariantOptionsAction } from "@/app/admin/orders/actions";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import type { OrderVariantOption } from "@/types/admin-orders";
import type { OptionItem } from "@/types/admin-products";
import { CART_QUANTITY_MAX, CUSTOM_SIZE_MAX_IN, CUSTOM_SIZE_MIN_IN } from "@/validation/shop";

/** One line in the "New order" form. `unitPrice` is for display; the server works out the real one. */
export type DraftOrderItem = {
  key: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
  addonIds: string[];
  addonNames: string[];
  customLengthIn: string;
  customWidthIn: string;
  unitPrice: number;
};

type AddOrderItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: OptionItem[];
  onAdd: (item: DraftOrderItem) => void;
};

const EMPTY_CHOICE = { productId: "", variantId: "", quantity: "1", addonIds: [] as string[], customLengthIn: "", customWidthIn: "" };

export function AddOrderItemDialog({ open, onOpenChange, products, onAdd }: AddOrderItemDialogProps) {
  const [choice, setChoice] = useState(EMPTY_CHOICE);
  const [variants, setVariants] = useState<OrderVariantOption[]>([]);
  const [error, setError] = useState("");
  const [isLoading, startLoading] = useTransition();
  const variant = variants.find((option) => option.id === choice.variantId);
  const chosenAddons = variant?.addons.filter((addon) => choice.addonIds.includes(addon.id)) ?? [];
  const unitPrice = (variant?.price ?? 0) + chosenAddons.reduce((sum, addon) => sum + addon.unitPrice, 0);

  function pickProduct(productId: string) {
    setChoice({ ...EMPTY_CHOICE, productId });
    setVariants([]);
    if (!productId) return;
    startLoading(async () => {
      const result = await listOrderVariantOptionsAction(productId);
      if (result.ok) setVariants(result.data);
      else toast.error(result.error);
    });
  }

  function toggleAddon(addonId: string, isChecked: boolean) {
    const addonIds = isChecked ? [...choice.addonIds, addonId] : choice.addonIds.filter((id) => id !== addonId);
    setChoice({ ...choice, addonIds });
  }

  function add() {
    const quantity = Number(choice.quantity);
    if (!variant) return setError("Choose a product and a size");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > CART_QUANTITY_MAX) return setError(`Quantity must be 1–${CART_QUANTITY_MAX}`);
    if (Boolean(choice.customLengthIn) !== Boolean(choice.customWidthIn)) return setError("Enter both length and width for a custom size");
    onAdd({
      key: crypto.randomUUID(),
      productName: products.find((product) => product.id === choice.productId)?.name ?? "",
      variantId: variant.id,
      variantLabel: variant.label,
      quantity,
      addonIds: chosenAddons.map((addon) => addon.id),
      addonNames: chosenAddons.map((addon) => addon.name),
      customLengthIn: choice.customLengthIn,
      customWidthIn: choice.customWidthIn,
      unitPrice,
    });
    setChoice(EMPTY_CHOICE);
    setVariants([]);
    setError("");
    onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add item" description="Prices come from the catalogue." submitLabel="Add item" isPending={isLoading} onSubmit={add}>
      <FormField id="item-product" label="Product">
        <OptionSelect id="item-product" value={choice.productId} placeholder="Choose a product" options={products.map((product) => ({ value: product.id, label: product.name }))} onChange={pickProduct} />
      </FormField>
      <FormField id="item-variant" label="Size and quality" help={isLoading ? "Loading sizes…" : undefined}>
        <OptionSelect
          id="item-variant"
          value={choice.variantId}
          disabled={!variants.length}
          placeholder={choice.productId && !isLoading && !variants.length ? "No active sizes" : "Choose a size"}
          options={variants.map((option) => ({ value: option.id, label: `${option.label} · ${formatPrice(option.price)}` }))}
          onChange={(variantId) => setChoice({ ...choice, variantId, addonIds: [] })}
        />
      </FormField>
      {variant?.addons.length ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Add-ons</legend>
          {variant.addons.map((addon) => (
            <label key={addon.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={choice.addonIds.includes(addon.id)} onCheckedChange={(isChecked) => toggleAddon(addon.id, isChecked)} />
              {addon.name} <span className="text-muted-foreground">+{formatPrice(addon.unitPrice)}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <FormField id="item-quantity" label="Quantity">
        <Input id="item-quantity" type="number" min={1} max={CART_QUANTITY_MAX} value={choice.quantity} onChange={(event) => setChoice({ ...choice, quantity: event.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="item-length" label="Custom length (in)">
          <Input id="item-length" type="number" min={CUSTOM_SIZE_MIN_IN} max={CUSTOM_SIZE_MAX_IN} value={choice.customLengthIn} onChange={(event) => setChoice({ ...choice, customLengthIn: event.target.value })} />
        </FormField>
        <FormField id="item-width" label="Custom width (in)">
          <Input id="item-width" type="number" min={CUSTOM_SIZE_MIN_IN} max={CUSTOM_SIZE_MAX_IN} value={choice.customWidthIn} onChange={(event) => setChoice({ ...choice, customWidthIn: event.target.value })} />
        </FormField>
      </div>
      <p className="text-xs text-muted-foreground">Custom size is optional: whole inches, {CUSTOM_SIZE_MIN_IN}–{CUSTOM_SIZE_MAX_IN}. It does not change the price.</p>
      {variant ? <p className="text-sm font-medium">Per unit: {formatPrice(unitPrice)}</p> : null}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </FormDialog>
  );
}

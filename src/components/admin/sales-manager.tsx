"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createSaleAction,
  deleteSaleAction,
  updateSaleAction,
} from "@/app/admin/sales/actions";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import type { OrderStatus, SaleOrder } from "@/types";

export type SaleProductOption = {
  id: string;
  name: string;
  variants: { id: string; label: string }[];
};

const STATUS_ITEMS: { value: OrderStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "in_production", label: "In production" },
  { value: "out_for_delivery", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "closed", label: "Closed" },
  { value: "issue", label: "Issue" },
];

function statusLabel(status: string) {
  return (
    STATUS_ITEMS.find((s) => s.value === status)?.label ??
    status.replaceAll("_", " ")
  );
}

function statusTone(status: OrderStatus) {
  if (status === "delivered" || status === "closed") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  }
  if (status === "out_for_delivery") {
    return "bg-sky-500/15 text-sky-800 dark:text-sky-300";
  }
  if (status === "issue") {
    return "bg-destructive/15 text-destructive";
  }
  if (status === "in_production") {
    return "bg-amber-500/15 text-amber-900 dark:text-amber-300";
  }
  return "bg-muted text-muted-foreground";
}

type FormState = {
  customerName: string;
  customerMobile: string;
  address: string;
  productId: string;
  variantId: string;
  quantity: string;
  agreedPrice: string;
  advancePaid: string;
  expectedDelivery: string;
  salespersonName: string;
  status: OrderStatus;
};

const emptyForm = (): FormState => ({
  customerName: "",
  customerMobile: "",
  address: "",
  productId: "",
  variantId: "",
  quantity: "1",
  agreedPrice: "",
  advancePaid: "0",
  expectedDelivery: "",
  salespersonName: "",
  status: "confirmed",
});

function formFromOrder(o: SaleOrder): FormState {
  return {
    customerName: o.customerName,
    customerMobile: o.customerMobile,
    address: o.address,
    productId: o.productId || "",
    variantId: o.variantId || "",
    quantity: String(o.quantity || 1),
    agreedPrice: String(o.agreedPrice ?? ""),
    advancePaid: String(o.advancePaid ?? 0),
    expectedDelivery: o.expectedDelivery || "",
    salespersonName: o.salesperson || "",
    status: o.status,
  };
}

export function SalesManager({
  orders,
  products,
  productNames,
}: {
  orders: SaleOrder[];
  products: SaleProductOption[];
  productNames: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SaleOrder | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (sheetOpen) {
      setForm(editing ? formFromOrder(editing) : emptyForm());
    }
  }, [sheetOpen, editing]);

  const variantItems = useMemo(() => {
    const product = products.find((p) => p.id === form.productId);
    return [
      { value: "__none__", label: "No variant" },
      ...(product?.variants.map((v) => ({ value: v.id, label: v.label })) ?? []),
    ];
  }, [products, form.productId]);

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(order: SaleOrder) {
    setEditing(order);
    setSheetOpen(true);
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const payload = {
        customerName: form.customerName,
        customerMobile: form.customerMobile,
        address: form.address,
        productId: form.productId || null,
        variantId:
          !form.variantId || form.variantId === "__none__"
            ? null
            : form.variantId,
        quantity: Number(form.quantity) || 1,
        agreedPrice: form.agreedPrice,
        advancePaid: form.advancePaid || "0",
        expectedDelivery: form.expectedDelivery,
        salespersonName: form.salespersonName,
        status: form.status,
      };

      const res = editing
        ? await updateSaleAction({ id: editing.id, ...payload })
        : await createSaleAction(payload);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editing ? "Sale updated" : "Sale recorded");
      setSheetOpen(false);
      setEditing(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteSaleAction(deleteId);
      setDeleteId(null);
      toast.success("Sale removed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {orders.length} sale{orders.length === 1 ? "" : "s"} · update delivery
          status as orders move
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="size-3.5" />
          Record sale
        </Button>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.customerMobile}
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm">
                  {o.productId
                    ? productNames[o.productId] ?? "Product"
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`font-normal capitalize ${statusTone(o.status)}`}
                  >
                    {statusLabel(o.status)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatINR(o.agreedPrice)}
                  <div className="text-xs text-muted-foreground">
                    Adv. {formatINR(o.advancePaid)}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {o.expectedDelivery || "—"}
                </TableCell>
                <TableCell>{o.salesperson || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Edit ${o.customerName}`}
                      onClick={() => openEdit(o)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={pending}
                      aria-label={`Delete ${o.customerName}`}
                      onClick={() => setDeleteId(o.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No sales yet — record the first one.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>{editing ? "Edit sale" : "Record sale"}</SheetTitle>
            <SheetDescription>
              Capture showroom sales and update delivery status (on the way,
              delivered, etc.).
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-3 px-4 pb-2 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Customer name</Label>
              <Input
                value={form.customerName}
                onChange={(e) => patch("customerName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Mobile</Label>
              <Input
                value={form.customerMobile}
                onChange={(e) => patch("customerMobile", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <AppSelect
                value={form.status}
                onValueChange={(v) => patch("status", v as OrderStatus)}
                triggerClassName="w-full"
                items={STATUS_ITEMS.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Delivery address</Label>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => patch("address", e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Product</Label>
              <AppSelect
                value={form.productId || "__none__"}
                onValueChange={(v) => {
                  const productId = v === "__none__" ? "" : v;
                  patch("productId", productId);
                  patch("variantId", "");
                }}
                triggerClassName="w-full"
                items={[
                  { value: "__none__", label: "Select product…" },
                  ...products.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Variant</Label>
              <AppSelect
                value={form.variantId || "__none__"}
                onValueChange={(v) =>
                  patch("variantId", v === "__none__" ? "" : v)
                }
                triggerClassName="w-full"
                items={variantItems}
                disabled={!form.productId}
              />
            </div>
            <div className="space-y-1">
              <Label>Qty</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => patch("quantity", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Agreed price (₹)</Label>
              <Input
                value={form.agreedPrice}
                onChange={(e) => patch("agreedPrice", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Advance paid (₹)</Label>
              <Input
                value={form.advancePaid}
                onChange={(e) => patch("advancePaid", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Expected delivery</Label>
              <Input
                type="date"
                value={form.expectedDelivery}
                onChange={(e) => patch("expectedDelivery", e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Salesperson</Label>
              <Input
                value={form.salespersonName}
                onChange={(e) => patch("salespersonName", e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={save}>
              {pending ? "Saving…" : editing ? "Save changes" : "Record sale"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationModal
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Remove this sale?"
        description="The order and its status history will be permanently deleted."
        confirmLabel="Remove"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

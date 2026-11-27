"use client";

import { useState } from "react";
import { saveGalleryPhotoAction } from "@/app/admin/media/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { MediaAdminItem } from "@/types/admin-content";
import type { OptionItem } from "@/types/admin-products";

type GalleryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: OptionItem[];
  /** Edit this photo; omit to add one. */
  photo?: MediaAdminItem;
};

const NEW_PHOTO = { imageUrl: "", title: "", area: "", deliveryMonth: "", productId: "", isPublished: false };

function toForm(photo?: MediaAdminItem) {
  if (!photo) return NEW_PHOTO;
  return {
    imageUrl: photo.imageUrl, title: photo.title ?? "", area: photo.area ?? "",
    deliveryMonth: photo.deliveryMonth ?? "", productId: photo.productId ?? "", isPublished: photo.isPublished,
  };
}

/** A delivered-home photo for the shop's home page. */
export function GalleryFormDialog({ open, onOpenChange, products, photo }: GalleryFormDialogProps) {
  const [form, setForm] = useState(() => toForm(photo));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function save() {
    run(
      () => saveGalleryPhotoAction(photo?.id ?? null, form),
      { loading: "Saving photo…", success: photo ? "Photo saved" : "Photo added", error: "Could not save the photo" },
      () => {
        setErrors({});
        onOpenChange(false);
        if (!photo) setForm(NEW_PHOTO);
      },
      setErrors,
    );
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={photo ? "Edit photo" : "Add photo"} description="Shown on the home page once published." submitLabel={photo ? "Save photo" : "Add photo"} isPending={isPending} onSubmit={save}>
      <FormField id="gallery-image" label="Image link" help="A site path (/images/…) or an https link." error={errors.imageUrl}>
        <Input id="gallery-image" value={form.imageUrl} aria-invalid={Boolean(errors.imageUrl)} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
      </FormField>
      <FormField id="gallery-title" label="Title (optional)" error={errors.title}>
        <Input id="gallery-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="gallery-area" label="Area" help="e.g. Miyapur" error={errors.area}>
          <Input id="gallery-area" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} />
        </FormField>
        <FormField id="gallery-month" label="Delivered" help="e.g. Sep 2026" error={errors.deliveryMonth}>
          <Input id="gallery-month" value={form.deliveryMonth} onChange={(event) => setForm({ ...form, deliveryMonth: event.target.value })} />
        </FormField>
      </div>
      <FormField id="gallery-product" label="Product (optional)" help="The photo links to this product in the shop." error={errors.productId}>
        <OptionSelect id="gallery-product" value={form.productId} noneLabel="No product" options={products.map((product) => ({ value: product.id, label: product.name }))} onChange={(productId) => setForm({ ...form, productId })} />
      </FormField>
      <ActiveSwitchField id="gallery-published" label="Published" help="Unpublished photos are hidden from the shop." checked={form.isPublished} onCheckedChange={(isPublished) => setForm({ ...form, isPublished })} />
    </FormDialog>
  );
}

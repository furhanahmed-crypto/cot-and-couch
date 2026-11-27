"use client";

import { useState } from "react";
import { createCollectionAction, updateCollectionAction } from "@/app/admin/collections/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { toSlug } from "@/lib/slug";
import type { CollectionAdminRow } from "@/types/admin-catalogue";

type CollectionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: CollectionAdminRow;
};

function toForm(collection?: CollectionAdminRow) {
  return {
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    isFeatured: collection?.isFeatured ?? false,
    isActive: collection?.isActive ?? true,
    sortOrder: String(collection?.sortOrder ?? 0),
  };
}

export function CollectionFormDialog({ open, onOpenChange, collection }: CollectionFormDialogProps) {
  const [form, setForm] = useState(() => toForm(collection));
  // New collections: the slug follows the name until it is edited by hand.
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(collection));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function changeName(name: string) {
    setForm({ ...form, name, slug: isSlugEdited ? form.slug : toSlug(name) });
  }

  function save() {
    const input = { ...form };
    run(
      () => (collection ? updateCollectionAction(collection.id, input) : createCollectionAction(input)),
      { loading: "Saving collection…", success: collection ? "Collection saved" : "Collection added", error: "Could not save the collection" },
      () => {
        setErrors({});
        onOpenChange(false);
        if (!collection) {
          setForm(toForm());
          setIsSlugEdited(false);
        }
      },
      setErrors,
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={collection ? "Edit collection" : "Add collection"}
      description="Hand-picked products. Featured collections show on the home page. Add products from the product editor."
      submitLabel={collection ? "Save collection" : "Add collection"}
      isPending={isPending}
      onSubmit={save}
    >
      <FormField id="collection-name" label="Name" error={errors.name}>
        <Input id="collection-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => changeName(event.target.value)} />
      </FormField>
      <FormField id="collection-slug" label="Slug" help="Used in the link: /collections/your-slug" error={errors.slug}>
        <Input
          id="collection-slug"
          value={form.slug}
          aria-invalid={Boolean(errors.slug)}
          onChange={(event) => {
            setIsSlugEdited(true);
            setForm({ ...form, slug: event.target.value });
          }}
        />
      </FormField>
      <FormField id="collection-description" label="Description" error={errors.description}>
        <Textarea id="collection-description" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </FormField>
      <FormField id="collection-order" label="Order" help="Lower numbers show first." error={errors.sortOrder}>
        <Input id="collection-order" type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
      </FormField>
      <ActiveSwitchField id="collection-featured" label="Featured" help="Shown on the home page." checked={form.isFeatured} onCheckedChange={(isFeatured) => setForm({ ...form, isFeatured })} />
      <ActiveSwitchField id="collection-active" label="Active" help="Inactive collections are hidden in the shop." checked={form.isActive} onCheckedChange={(isActive) => setForm({ ...form, isActive })} />
    </FormDialog>
  );
}

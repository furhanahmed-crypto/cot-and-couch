"use client";

import { useState } from "react";
import { saveReelAction } from "@/app/admin/media/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { MediaAdminItem } from "@/types/admin-content";

type ReelFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this reel; omit to add one. */
  reel?: MediaAdminItem;
};

const NEW_REEL = { title: "", imageUrl: "", videoUrl: "", instagramUrl: "", tags: "", isPublished: false };

function toForm(reel?: MediaAdminItem) {
  if (!reel) return NEW_REEL;
  return {
    title: reel.title ?? "", imageUrl: reel.imageUrl, videoUrl: reel.videoUrl ?? "",
    instagramUrl: reel.instagramUrl ?? "", tags: reel.tags.join(", "), isPublished: reel.isPublished,
  };
}

/** A short video for the shop. Tags decide where it shows (e.g. "mattresses"). */
export function ReelFormDialog({ open, onOpenChange, reel }: ReelFormDialogProps) {
  const [form, setForm] = useState(() => toForm(reel));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();

  function save() {
    run(
      () => saveReelAction(reel?.id ?? null, form),
      { loading: "Saving reel…", success: reel ? "Reel saved" : "Reel added", error: "Could not save the reel" },
      () => {
        setErrors({});
        onOpenChange(false);
        if (!reel) setForm(NEW_REEL);
      },
      setErrors,
    );
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={reel ? "Edit reel" : "Add reel"} description="Shown in the shop once published." submitLabel={reel ? "Save reel" : "Add reel"} isPending={isPending} onSubmit={save}>
      <FormField id="reel-title" label="Title" error={errors.title}>
        <Input id="reel-title" value={form.title} aria-invalid={Boolean(errors.title)} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      </FormField>
      <FormField id="reel-cover" label="Cover image link" help="A site path (/images/…) or an https link." error={errors.imageUrl}>
        <Input id="reel-cover" value={form.imageUrl} aria-invalid={Boolean(errors.imageUrl)} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
      </FormField>
      <FormField id="reel-video" label="Video link" help="An https link to the video file." error={errors.videoUrl}>
        <Input id="reel-video" type="url" value={form.videoUrl} aria-invalid={Boolean(errors.videoUrl)} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} />
      </FormField>
      <FormField id="reel-instagram" label="Instagram link (optional)" error={errors.instagramUrl}>
        <Input id="reel-instagram" type="url" value={form.instagramUrl} aria-invalid={Boolean(errors.instagramUrl)} onChange={(event) => setForm({ ...form, instagramUrl: event.target.value })} />
      </FormField>
      <FormField id="reel-tags" label="Tags" help={`Comma separated. "home" shows it on the home page; a category, product or collection slug (e.g. mattresses) shows it on that page.`} error={errors.tags}>
        <Input id="reel-tags" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
      </FormField>
      <ActiveSwitchField id="reel-published" label="Published" help="Unpublished reels are hidden from the shop." checked={form.isPublished} onCheckedChange={(isPublished) => setForm({ ...form, isPublished })} />
    </FormDialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStoreSettingsAction } from "@/app/admin/ops/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoreInfo } from "@/types";

export function SettingsForm({ store }: { store: StoreInfo }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(store);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateStoreSettingsAction(form);
          setSaved(true);
          router.refresh();
        });
      }}
    >
      {(
        [
          ["name", "Name"],
          ["address", "Address"],
          ["mapUrl", "Map URL"],
          ["timings", "Timings"],
          ["phone", "Phone"],
          ["whatsapp", "WhatsApp"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1">
          <Label>{label}</Label>
          <Input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        </div>
      ))}
      <div className="space-y-1">
        <Label>Privacy notice</Label>
        <Textarea
          rows={5}
          value={form.privacyNotice}
          onChange={(e) =>
            setForm((f) => ({ ...f, privacyNotice: e.target.value }))
          }
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          Save settings
        </Button>
        {saved && (
          <span className="text-sm text-muted-foreground">Saved.</span>
        )}
      </div>
    </form>
  );
}

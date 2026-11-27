"use client";

import { useState } from "react";
import { saveStoreSettingsAction } from "@/app/admin/settings/actions";
import { FormField } from "@/components/admin/common/form-field";
import { SaveBar } from "@/components/admin/common/save-bar";
import { SectionCard } from "@/components/admin/common/section-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { StoreInfo } from "@/types/shop";

type Field = keyof StoreInfo;

/** Store · Contact · Privacy notice, with one Save. */
export function StoreSettingsForm({ initial }: { initial: StoreInfo }) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function input(field: Field, label: string, help?: string) {
    return (
      <FormField id={`store-${field}`} label={label} help={help} error={errors[field]}>
        <Input id={`store-${field}`} value={form[field]} aria-invalid={Boolean(errors[field])} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
      </FormField>
    );
  }

  function save() {
    run(
      () => saveStoreSettingsAction(form),
      { loading: "Saving store details…", success: "Store details saved", error: "Could not save the store details" },
      () => {
        setErrors({});
        setSaved(form);
      },
      setErrors,
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-20">
      <SectionCard title="Store">
        {input("name", "Store name")}
        <FormField id="store-address" label="Address" error={errors.address}>
          <Textarea id="store-address" rows={2} value={form.address} aria-invalid={Boolean(errors.address)} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </FormField>
        {input("mapUrl", "Map link", "Google Maps link for Directions.")}
        {input("timings", "Timings", "e.g. Mon–Sun · 10:00 AM – 9:00 PM")}
      </SectionCard>
      <SectionCard title="Contact">
        {input("phone", "Phone", "Shown to customers and used for Call, e.g. +91 98765 43210.")}
        {input("whatsapp", "WhatsApp number", "91 and the 10-digit number, e.g. 919876543210.")}
      </SectionCard>
      <SectionCard title="Privacy notice">
        <FormField id="store-privacyNotice" label="Notice" help="Shown on the privacy page." error={errors.privacyNotice}>
          <Textarea id="store-privacyNotice" rows={6} value={form.privacyNotice} aria-invalid={Boolean(errors.privacyNotice)} onChange={(event) => setForm({ ...form, privacyNotice: event.target.value })} />
        </FormField>
      </SectionCard>
      <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setForm(saved)} />
    </div>
  );
}

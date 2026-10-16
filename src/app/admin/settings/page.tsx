"use client";

import { useState } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storeInfo as seedStore } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";

export default function SettingsPage() {
  return (
    <AdminGate title="Store settings">
      <SettingsForm />
    </AdminGate>
  );
}

function SettingsForm() {
  const [form, setForm] = useState({ ...seedStore });

  function save(e: React.FormEvent) {
    e.preventDefault();
    mockToast("Store settings saved in memory only");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Store settings" description="Showroom details shown on the storefront (mock form)." />
      <MockBanner compact />
      <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Store name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            rows={3}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timings">Timings</Label>
          <Input
            id="timings"
            value={form.timings}
            onChange={(e) => setForm((f) => ({ ...f, timings: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" className="bg-ink">
          Save (mock)
        </Button>
      </form>
    </div>
  );
}

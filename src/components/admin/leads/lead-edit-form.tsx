"use client";

import { useState } from "react";
import { updateLeadAction } from "@/app/admin/leads/actions";
import { ActiveSwitchField } from "@/components/admin/common/active-switch-field";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { Button } from "@/components/ui/button";
import { LEAD_INTENTS, LEAD_INTENT_LABELS, type LeadIntent } from "@/constants/leads";
import { useActionToast } from "@/hooks/use-action-toast";
import type { LeadDetail } from "@/types/admin-leads";
import type { OptionItem } from "@/types/admin-products";

const INTENT_OPTIONS = LEAD_INTENTS.map((intent) => ({ value: intent, label: LEAD_INTENT_LABELS[intent] }));

/** Intent, assignee and follow-up: the three things staff change on a lead. */
export function LeadEditForm({ lead, staff }: { lead: LeadDetail; staff: OptionItem[] }) {
  const initial = { intent: lead.intent, assignedToId: lead.assignedToId ?? "", followUpDone: lead.followUpDone };
  const [form, setForm] = useState(initial);
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  function save() {
    run(() => updateLeadAction(lead.id, form), { loading: "Saving lead…", success: "Lead saved", error: "Could not save the lead" });
  }

  return (
    <div className="space-y-4">
      <FormField id="lead-intent" label="Intent">
        <OptionSelect id="lead-intent" value={form.intent} options={INTENT_OPTIONS} onChange={(intent) => setForm({ ...form, intent: intent as LeadIntent })} />
      </FormField>
      <FormField id="lead-assignee" label="Assigned to">
        <OptionSelect
          id="lead-assignee"
          value={form.assignedToId}
          noneLabel="Not assigned"
          options={staff.map((member) => ({ value: member.id, label: member.name }))}
          onChange={(assignedToId) => setForm({ ...form, assignedToId })}
        />
      </FormField>
      <ActiveSwitchField
        id="lead-follow-up"
        label="Follow-up done"
        help="Turn on once someone has called or messaged them."
        checked={form.followUpDone}
        onCheckedChange={(followUpDone) => setForm({ ...form, followUpDone })}
      />
      <Button type="button" className="w-full" disabled={!isDirty || isPending} onClick={save}>
        Save lead
      </Button>
    </div>
  );
}

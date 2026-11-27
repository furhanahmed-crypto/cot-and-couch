"use client";

import { FilterSelect } from "@/components/admin/common/filter-select";
import { SearchInput } from "@/components/admin/common/search-input";
import { TableToolbar } from "@/components/admin/common/table-toolbar";
import { LEAD_INTENTS, LEAD_INTENT_LABELS } from "@/constants/leads";
import { LEAD_FILTER_PARAMS } from "@/lib/lead-admin-params";
import { UNASSIGNED } from "@/types/admin-leads";
import type { OptionItem } from "@/types/admin-products";

const INTENT_OPTIONS = LEAD_INTENTS.map((intent) => ({ value: intent, label: LEAD_INTENT_LABELS[intent] }));
const FOLLOW_UP_OPTIONS = [
  { value: "pending", label: "Follow-up pending" },
  { value: "done", label: "Follow-up done" },
];

/** Search · Intent · Assigned to · Follow-up. */
export function LeadsToolbar({ staff }: { staff: OptionItem[] }) {
  const assignedOptions = [{ value: UNASSIGNED, label: "Not assigned" }, ...staff.map((member) => ({ value: member.id, label: member.name }))];
  return (
    <TableToolbar paramNames={LEAD_FILTER_PARAMS}>
      <SearchInput placeholder="Search name or phone" />
      <FilterSelect paramName="intent" allLabel="All intents" options={INTENT_OPTIONS} />
      <FilterSelect paramName="assigned" allLabel="Anyone assigned" options={assignedOptions} />
      <FilterSelect paramName="followUp" allLabel="Any follow-up" options={FOLLOW_UP_OPTIONS} />
    </TableToolbar>
  );
}

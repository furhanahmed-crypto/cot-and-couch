"use client";

import { useUrlParams } from "@/hooks/use-url-params";

/** Opens the lead's side sheet (`?lead=id`) and keeps the filters and page. */
export function LeadOpenLink({ leadId, name }: { leadId: string; name: string }) {
  const { setParams } = useUrlParams();
  return (
    <button type="button" className="block max-w-48 truncate text-left font-medium hover:text-brass" title={name} onClick={() => setParams({ lead: leadId }, { keepPage: true })}>
      {name}
    </button>
  );
}

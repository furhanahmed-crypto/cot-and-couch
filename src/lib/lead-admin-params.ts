import { LEAD_INTENTS } from "@/constants/leads";
import { parsePage, readParam } from "@/lib/list-params";
import { LEAD_FOLLOW_UP_FILTERS, UNASSIGNED, type LeadAdminFilters } from "@/types/admin-leads";
import { idSchema } from "@/validation/common";

type SearchParams = Record<string, string | string[] | undefined>;

/** `?q=&intent=&assigned=&followUp=&page=` -> filters. Invalid values are ignored. */
export function parseLeadAdminFilters(params: SearchParams): LeadAdminFilters {
  const intent = readParam(params.intent);
  const assigned = readParam(params.assigned);
  const followUp = readParam(params.followUp);
  return {
    q: readParam(params.q),
    intent: LEAD_INTENTS.find((item) => item === intent) ?? null,
    assignedTo: assigned === UNASSIGNED || idSchema.safeParse(assigned).success ? assigned : null,
    followUp: LEAD_FOLLOW_UP_FILTERS.find((item) => item === followUp) ?? null,
    page: parsePage(params.page),
  };
}

/** `?lead=<id>` opens that lead's side sheet. */
export function parseOpenLeadId(params: SearchParams): string | null {
  const id = readParam(params.lead);
  return idSchema.safeParse(id).success ? id : null;
}

/** The URL keys the leads toolbar controls ("Clear filters" removes them). */
export const LEAD_FILTER_PARAMS = ["q", "intent", "assigned", "followUp"];

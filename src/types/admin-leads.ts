import type { LeadEventType, LeadIntent } from "@/constants/leads";

export const LEAD_FOLLOW_UP_FILTERS = ["pending", "done"] as const;
type LeadFollowUpFilter = (typeof LEAD_FOLLOW_UP_FILTERS)[number];

/** `?assigned=none` lists leads nobody is following up. */
export const UNASSIGNED = "none";

export type LeadAdminFilters = {
  q: string;
  intent: LeadIntent | null;
  /** A staff profile id, "none", or null for everyone. */
  assignedTo: string | null;
  followUp: LeadFollowUpFilter | null;
  page: number;
};

export type LeadAdminRow = {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  intent: LeadIntent;
  assignedToName: string | null;
  lastSeenAt: string;
  followUpDone: boolean;
};

export type LeadEventEntry = {
  id: string;
  type: LeadEventType;
  productName: string | null;
  details: Record<string, string>;
  occurredAt: string;
};

export type LeadDetail = LeadAdminRow & {
  email: string | null;
  assignedToId: string | null;
  wantsWhatsappOffers: boolean;
  firstSeenAt: string;
  events: LeadEventEntry[];
};

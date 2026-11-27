export const LEAD_INTENTS = ["hot", "warm", "cold"] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_EVENT_TYPES = ["view", "shortlist", "cta", "login"] as const;
export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];

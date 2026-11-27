export const LEAD_INTENTS = ["hot", "warm", "cold"] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

export const LEAD_EVENT_TYPES = ["view", "shortlist", "cta", "login"] as const;
export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];

export const LEAD_INTENT_LABELS: Record<LeadIntent, string> = { hot: "Hot", warm: "Warm", cold: "Cold" };

export const LEAD_INTENT_TONES = { hot: "danger", warm: "accent", cold: "neutral" } as const satisfies Record<LeadIntent, string>;
